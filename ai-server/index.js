require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const upload = multer({ dest: path.join(__dirname, 'tmp') });

const PORT = process.env.PORT || 4000;
const MODEL = 'gemini-2.5-flash'; // Free tier model, no billing required

// Multi-API key support for load balancing and redundancy
// Automatically loads all GOOGLE_API_KEY_* variables from environment
const initializeApiKeys = () => {
  const keys = [];
  
  // Try primary key (GOOGLE_API_KEY or GOOGLE_API_KEY_1)
  const primaryKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY_1;
  if (primaryKey) {
    keys.push({
      id: 'key1',
      key: primaryKey,
      usageCount: 0,
      lastResetTime: Date.now(),
      isRateLimited: false,
    });
  }
  
  // Load additional keys (GOOGLE_API_KEY_2, GOOGLE_API_KEY_3, GOOGLE_API_KEY_4, etc.)
  let keyIndex = 2;
  while (process.env[`GOOGLE_API_KEY_${keyIndex}`]) {
    keys.push({
      id: `key${keyIndex}`,
      key: process.env[`GOOGLE_API_KEY_${keyIndex}`],
      usageCount: 0,
      lastResetTime: Date.now(),
      isRateLimited: false,
    });
    keyIndex++;
  }
  
  if (keys.length === 0) {
    console.warn('⚠️ No API keys found! Set GOOGLE_API_KEY, GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, GOOGLE_API_KEY_3, etc. in .env');
  } else {
    console.log(`✅ Loaded ${keys.length} API key(s) for load balancing`);
  }
  
  return keys;
};

const API_KEYS = initializeApiKeys();

// Select the best API key: prioritize non-rate-limited keys, then lowest usage
const selectApiKey = () => {
  if (API_KEYS.length === 0) {
    return null;
  }
  
  // Filter out rate-limited keys
  const availableKeys = API_KEYS.filter(k => !k.isRateLimited);
  
  // If all keys are rate limited, use the one with lowest usage anyway
  const keysToConsider = availableKeys.length > 0 ? availableKeys : API_KEYS;
  
  // Sort by usage count (ascending) and return the first (lowest usage)
  keysToConsider.sort((a, b) => a.usageCount - b.usageCount);
  const selectedKey = keysToConsider[0];
  
  if (availableKeys.length > 0 && availableKeys.length < API_KEYS.length) {
    const rateLimitedCount = API_KEYS.length - availableKeys.length;
    console.log(`📊 ${selectedKey.id} selected (${selectedKey.usageCount} uses) | ${rateLimitedCount} key(s) rate limited`);
  }
  
  return selectedKey;
};

// Calculate next reset time for all keys (24 hours from last reset)
const getNextResetTime = () => {
  const oneDay = 24 * 60 * 60 * 1000;
  // Find the earliest next reset time across all keys
  const resetTimes = API_KEYS.map(k => k.lastResetTime + oneDay);
  return Math.min(...resetTimes);
};

// Reset usage counters daily for all keys
const resetUsageCounters = () => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  API_KEYS.forEach((keyObj) => {
    if (now - keyObj.lastResetTime > oneDay) {
      keyObj.usageCount = 0;
      keyObj.lastResetTime = now;
      keyObj.isRateLimited = false;
      console.log(`🔄 Daily usage reset for ${keyObj.id}`);
    }
  });
};

// Extract text from different file formats
const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      // PDF extraction
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      return (pdfData && pdfData.text) ? pdfData.text : '';
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
      // Word document extraction (.docx or .doc)
      const docxData = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: docxData });
      return result.value || '';
    } else if (mimeType === 'text/plain') {
      // Plain text file
      return fs.readFileSync(filePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file format: ${mimeType}`);
    }
  } catch (error) {
    console.error(`❌ Error extracting text from file:`, error.message);
    throw error;
  }
};

// Check usage before each request
const checkAndResetCounters = () => {
  resetUsageCounters();
};

app.use(express.json({ limit: '10mb' }));

// POST /analyze - accepts multipart form-data with 'file' (PDF, Word, or Text) and 'method' (quiz|summary|flashcards|practice)
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const method = req.body.method || 'summary';
    const quantity = parseInt(req.body.quantity || '3');
    const difficulty = req.body.difficulty || 'medium';
    if (!req.file) return res.status(400).json({ error: 'Missing file' });

    // Extract text from file based on its MIME type
    const mimeType = req.file.mimetype;
    const text = await extractTextFromFile(req.file.path, mimeType);
    
    if (!text) {
      return res.status(400).json({ error: 'Could not extract text from file. Please ensure the file is readable.' });
    }

    // Function to generate summary prompt based on quantity level (1-5)
    const getSummaryPrompt = (level) => {
      const prompts = {
        1: `Create a BRIEF, CONCISE summary with ONLY essential information. Focus on the absolute key points and main ideas.

## Key Concepts
Number each concept 1-7 and provide:
- Definition or explanation
- Key details as bullet points
- Main application or example

Format each as:
1. [Concept Name]
   • Definition: [concise definition]
   • Key Detail: [important point]
   • Application: [how it's used]

## Summary
Provide a 150-200 word concise paragraph of the main topic and key takeaways.`,

        2: `Create a QUICK OVERVIEW summary with important details but not excessive length.

## Overview
Provide a 50-100 word opening paragraph covering main topic and significance.

## Key Concepts
Number each concept 1-12 and provide:
- Definition or explanation
- Key characteristics as bullet points
- Significance or use case

Format each as:
1. [Concept Name]
   • Definition: [explanation]
   • Key Point: [important detail]
   • Significance: [why it matters]

## Main Themes
Number 5-8 major themes or theories with:
- Definition/explanation
- Supporting details
- Applications

## Practical Applications
Number 3-4 real-world examples with context and relevance.`,

        3: `Create a BALANCED, WELL-ROUNDED summary with good depth and proper structure.

## Overview
Provide a 100-150 word comprehensive opening covering main topic, significance, and scope.

## Core Concepts & Definitions
Number each concept 1-15 and provide:
- Concept name
- Definition with context
- Key characteristics as bullet points
- How it relates to the topic

Format:
1. [Concept Name]
   • Definition: [comprehensive explanation]
   • Key Feature: [important characteristic]
   • Application: [practical use]
   • Context: [how it fits in topic]

## Main Theories & Frameworks
Number 5-8 major theories with:
- Name and definition
- Key components
- How they work
- Real-world applications

## Examples & Case Studies
Number 3-5 detailed examples with:
- Scenario description
- Key points illustrated
- Outcomes or lessons

## Key Takeaways
Number 5-7 important insights with significance and how to apply them.`,

        4: `Create a DETAILED, COMPREHENSIVE summary with substantial depth. Include extensive explanations, multiple examples, case studies, analysis, and connections between concepts.

## Overview (150-200 words)
Comprehensive opening covering topic, significance, scope, relevance, and key takeaways.

## Core Concepts & Definitions (15-20 items)
Key concepts with extensive explanations, context, applications, and examples.

## Detailed Theory & Analysis (8-12 major sections)
Primary theories, frameworks, supporting evidence, research findings, comparative analysis.

## Examples & Case Studies (5-8 detailed examples)
Real-world examples with context, implementation, results, and lessons learned.

## Practical Applications (5-8 implementation guides)
Actionable guidance with steps, tools, and expected results.

## Critical Insights (5-8 insights)
Important findings, implications, and non-obvious connections.

## Considerations & Limitations (3-5 items)
Important limitations, risks, and when to apply different approaches.`,

        5: `Create an EXHAUSTIVE, COMPREHENSIVE, MASTERCLASS-LEVEL summary with ALL details. This must be EXCEPTIONALLY THOROUGH with extensive details, NUMEROUS examples, DEEP analysis, MULTIPLE case studies, and CRITICAL examination.

## 📋 Executive Overview
Provide a 8-10 sentence comprehensive overview including: main topic, significance, scope, relevance, target audience, prerequisites, and key takeaways summary.

## 🎯 Core Concepts & Definitions (COMPREHENSIVE)
List 20-25 key concepts with EXTENSIVE explanations including definitions, origins, contexts, applications, variations, and examples.

## 📚 Detailed Theory, Framework & Analysis (EXHAUSTIVE)
Provide 30-40 key points covering: theories, models, frameworks, evidence, research, statistics, case studies, comparative analysis, limitations, historical development, trends, and connections.

### Major Subtopics (4-6 sections)
Each with: detailed explanation, historical context, 3-5 specific examples, supporting evidence, practical applications, variations, and counter-arguments.

## 💡 Examples, Case Studies & Illustrations (EXTENSIVE)
Provide 8-12 detailed case studies and examples with: background, challenge, methodology, implementation, results, metrics, lessons learned, and implications.

## 🔑 Critical Insights & Analysis
Provide 8-12 critical insights with detailed explanations of significance, implications, consequences, and how to leverage them.

## 📊 Comprehensive Data & Research
Important statistical findings, research methodologies, significance of findings, trends, benchmarks, and quantitative evidence.

## 🎓 Detailed Applications & Best Practices
Provide 10-15 comprehensive implementation guides with: prerequisites, detailed steps, tools needed, timeline, challenges, mitigation strategies, and success metrics.

## 🔗 Connections & Relationships
Provide 10-15 detailed relationship analyses showing how concepts relate, their impacts, systemic implications, cause-and-effect chains, and feedback loops.

## ⚠️ Critical Considerations, Limitations & Risks
Provide 10-15 detailed considerations: pitfalls, misconceptions, limitations, risks, mitigation strategies, ethical considerations, warning signs, and when to reconsider approaches.

## 🌟 Advanced Topics & Future Directions
Provide 8-12 advanced topics: cutting-edge developments, emerging trends with analysis, predicted future developments, advanced techniques, integrations with related fields, potential disruptions, and research frontiers.`
      };
      return prompts[level] || prompts[3]; // Default to Level 3 (Balanced)
    };

    // Build a structured prompt depending on method
    let promptPrefix = '';
    let jsonFormat = '';
    switch (method) {
      case 'quiz':
        promptPrefix = `Create a ${quantity}-question multiple-choice quiz based on the following text. Return as JSON array:`;
        jsonFormat = `[
          {
            "id": 1,
            "question": "question text",
            "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
            "correctIndex": 0,
            "explanation": "why this is correct"
          }
        ]`;
        break;
      case 'flashcards':
        promptPrefix = `Create ${quantity} flashcards from the text. Return as JSON array:`;
        jsonFormat = `[
          {
            "id": 1,
            "front": "term/question",
            "back": "definition/answer"
          }
        ]`;
        break;
      case 'practice':
        promptPrefix = `Create ${quantity} practice exam-style multiple-choice questions with difficulty ratings. Format as JSON array:`;
        jsonFormat = `[
          {
            "id": 1,
            "question": "question text",
            "difficulty": "easy|medium|hard",
            "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
            "correctIndex": 0
          }
        ]`;
        break;
      default:
        // summary - use quantity-based prompt
        promptPrefix = getSummaryPrompt(Math.max(1, Math.min(5, quantity)));
        break;
    }

    const prompt = jsonFormat 
      ? `${promptPrefix}\n\nJSON format:\n${jsonFormat}\n\nText:\n${text.substring(0, 200000)}`
      : `${promptPrefix}\n\n${text.substring(0, 200000)}`;

    // Check and reset daily counters
    checkAndResetCounters();

    // Select the best API key based on usage
    const selectedKeyObj = selectApiKey();
    const GOOGLE_API_KEY = selectedKeyObj?.key;

    // If no API key configured, just return extracted text + prompt suggestion
    if (!GOOGLE_API_KEY) {
      // cleanup
      fs.unlinkSync(req.file.path);
      return res.json({ 
        extractedText: text, 
        prompt, 
        error: 'No GOOGLE_API_KEY configured. Set GOOGLE_API_KEY or GOOGLE_API_KEY_1 and GOOGLE_API_KEY_2 in .env' 
      });
    }

    // Call Google Generative AI using the official SDK
    try {
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL });

      // For summaries, request maximum length response with extensive tokens (5x improvement)
      const generationConfig = method === 'summary' ? {
        maxOutputTokens: 8192,
      } : {};

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      const aiOutput = result.response.text();

      // Increment usage counter for the key used
      selectedKeyObj.usageCount++;
      console.log(`✅ ${selectedKeyObj.id} used successfully. Usage count: ${selectedKeyObj.usageCount}`);

      // Try to parse JSON from the AI output
      let structuredData = aiOutput;
      if (typeof aiOutput === 'string') {
        try {
          // Look for JSON array or object in the string
          const jsonMatch = aiOutput.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredData = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // If parsing fails, just return the raw output string
          structuredData = aiOutput;
        }
      }

      // cleanup
      fs.unlinkSync(req.file.path);

      return res.json({ extractedText: text, method, ai: structuredData });
    } catch (aiErr) {
      console.error('Gemini API error:', aiErr);
      
      // Handle rate limit errors (429)
      if (aiErr.status === 429) {
        console.warn(`⚠️ Rate limit hit on ${selectedKeyObj.id}`);
        selectedKeyObj.isRateLimited = true;
        
        // Try to find an available backup key and retry
        const backupKey = selectApiKey();
        if (backupKey && backupKey.id !== selectedKeyObj.id) {
          console.log(`🔄 Attempting retry with ${backupKey.id}...`);
          try {
            const genAI = new GoogleGenerativeAI(backupKey.key);
            const model = genAI.getGenerativeModel({ model: MODEL });

            const generationConfig = method === 'summary' ? {
              maxOutputTokens: 8192,
            } : {};

            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig,
            });
            const aiOutput = result.response.text();
            
            backupKey.usageCount++;
            console.log(`✅ Switched to ${backupKey.id}. Usage count: ${backupKey.usageCount}`);

            let structuredData = aiOutput;
            if (typeof aiOutput === 'string') {
              try {
                const jsonMatch = aiOutput.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
                if (jsonMatch) {
                  structuredData = JSON.parse(jsonMatch[0]);
                }
              } catch (e) {
                structuredData = aiOutput;
              }
            }

            fs.unlinkSync(req.file.path);
            return res.json({ extractedText: text, method, ai: structuredData, keyUsed: backupKey.id });
          } catch (retryErr) {
            console.error(`❌ Backup key ${backupKey.id} also failed:`, retryErr.message);
            // All keys exhausted - calculate reset time
            const resetTimeMs = getNextResetTime();
            const resetTime = new Date(resetTimeMs);
            fs.unlinkSync(req.file.path);
            return res.status(429).json({ 
              error: 'Daily usage limit reached',
              detail: 'You have reached your daily processing limit. Please try again tomorrow.',
              resetTime: resetTime.toISOString(),
              resetTimeReadable: resetTime.toLocaleString()
            });
          }
        }
        
        // Daily limit reached - return reset time
        const resetTimeMs = getNextResetTime();
        const resetTime = new Date(resetTimeMs);
        fs.unlinkSync(req.file.path);
        return res.status(429).json({ 
          error: 'Daily usage limit reached',
          detail: 'You have reached your daily processing limit. Please try again tomorrow.',
          resetTime: resetTime.toISOString(),
          resetTimeReadable: resetTime.toLocaleString()
        });
      }

      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'AI API error', detail: aiErr.message });
    }
  } catch (e) {
    console.error('analyze error', e);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return res.status(500).json({ error: 'server error', detail: e.message });
  }
});

app.get('/', (req, res) => res.send('LearnMate AI server running'));

// Status endpoint to check API key usage and status
app.get('/status', (req, res) => {
  checkAndResetCounters();
  
  const keysStatus = {};
  API_KEYS.forEach((keyObj) => {
    keysStatus[keyObj.id] = {
      configured: !!keyObj.key,
      usageCount: keyObj.usageCount,
      isRateLimited: keyObj.isRateLimited,
      lastReset: new Date(keyObj.lastResetTime).toISOString(),
    };
  });
  
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    totalKeysLoaded: API_KEYS.length,
    keys: keysStatus,
  });
});

const server = app.listen(PORT, '0.0.0.0', () => console.log(`AI server listening on port ${PORT}`));

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle process errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
