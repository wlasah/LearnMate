# Dual Google API Keys Setup for LearnMate

## Overview
The AI server now supports dual API keys for automatic load balancing and failover. This allows you to use two Google accounts to maximize API quota for your presentation.

## Setup Instructions

### Step 1: Create Second Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing account)
3. Enable **Generative Language API**
4. Create an API key from Credentials section

### Step 2: Update .env File
Edit `ai-server/.env` and add:

```
GOOGLE_API_KEY=your_first_api_key_here
GOOGLE_API_KEY_1=your_first_api_key_here
GOOGLE_API_KEY_2=your_second_api_key_here
```

### Step 3: Restart AI Server
```bash
npm start
```

## How It Works

### Smart Key Selection
- Server automatically tracks usage count for each key
- Always uses the key with lowest usage
- Switches keys every 24 hours (resets counters daily)

### Rate Limit Handling
- If a key hits rate limit (429 error), it's marked as limited
- Automatically tries the other key
- Logs which key is being used

### Monitoring Usage
Check API key status at: `http://localhost:4000/status`

Response shows:
```json
{
  "keys": {
    "primary": {
      "configured": true,
      "usageCount": 12,
      "isRateLimited": false,
      "lastReset": "2024-12-14T10:00:00.000Z"
    },
    "secondary": {
      "configured": true,
      "usageCount": 8,
      "isRateLimited": false,
      "lastReset": "2024-12-14T10:00:00.000Z"
    }
  }
}
```

## For Your Presentation Tomorrow

### Quick Checklist
- [ ] Create second Google API key
- [ ] Add both keys to `.env`
- [ ] Test by calling `/status` endpoint
- [ ] Pre-generate sample summaries/quizzes for demo backup
- [ ] Keep both keys active during presentation

### Limits Per Key
- **Requests Per Minute (RPM)**: 5 per key = **10 total**
- **Tokens Per Minute (TPM)**: 250K per key = **500K total**
- **Requests Per Day (RPD)**: 20 per key = **40 total**

With both keys, your daily quota effectively doubles!

### If Both Keys Hit Limit
Fallback options:
1. Wait for daily reset (midnight UTC)
2. Pre-cached summaries (stored in AsyncStorage)
3. Show static demo content

## Troubleshooting

### Keys not being used equally?
- Check `/status` endpoint to see usage distribution
- Server prefers lowest usage key

### Both keys rate limited?
- API returns 429 error
- Client shows: "Both API keys rate limited"
- Wait for daily reset or use pre-cached content

### Secondary key not detected?
- Verify `GOOGLE_API_KEY_2` is set in `.env`
- Restart AI server after updating `.env`
- Check server logs: "secondary key: key configured"

## Performance Tips for Demo

1. **Pre-generate content** - Create sample outputs before presentation
2. **Test rate limits** - Know when you'll hit limits
3. **Have backup examples** - Keep 3-4 pre-made summaries ready
4. **Monitor usage** - Check `/status` between demos
5. **Space out requests** - Don't rapid-fire multiple PDFs
