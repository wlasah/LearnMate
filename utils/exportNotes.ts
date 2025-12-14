// Utility functions for exporting notes
export const exportAsText = (title: string, content: string, topic?: string, tags?: string[]): string => {
  let text = `${title}\n`;
  text += `${'='.repeat(title.length)}\n\n`;
  
  if (topic) text += `Topic: ${topic}\n`;
  if (tags && tags.length > 0) text += `Tags: ${tags.join(', ')}\n`;
  
  if (topic || (tags && tags.length > 0)) text += '\n---\n\n';
  
  text += content;
  
  return text;
};

export const exportAsMarkdown = (title: string, content: string, topic?: string, tags?: string[]): string => {
  let md = `# ${title}\n\n`;
  
  if (topic) md += `**Topic:** ${topic}\n`;
  if (tags && tags.length > 0) md += `**Tags:** ${tags.map(t => `\`${t}\``).join(', ')}\n`;
  
  if (topic || (tags && tags.length > 0)) md += '\n---\n\n';
  
  md += content;
  
  return md;
};

// Simple PDF generation (text-based, no images)
export const exportAsPDF = async (title: string, content: string, topic?: string, tags?: string[]): Promise<string> => {
  // For a complete PDF solution, you'd use a library like react-native-pdf or similar
  // For now, we'll create a basic text representation
  const text = exportAsText(title, content, topic, tags);
  return text;
};
