# Multi-API Key Setup Guide

This guide explains how to configure multiple Google API keys with automatic load balancing and fallback support.

## Why Multiple API Keys?

- **Avoid Rate Limiting**: Distribute requests across multiple keys to stay within quota limits
- **Higher Throughput**: Process more requests simultaneously
- **Redundancy**: If one key hits rate limits, automatically switch to another
- **Cost Control**: Spread usage across multiple free-tier accounts if needed

## Quick Setup

### Option 1: Single Key (Simple)

If you only have one API key, set it in your `.env`:

```env
GOOGLE_API_KEY=your_key_here
PORT=4000
```

### Option 2: Multiple Keys (Recommended)

Add multiple keys in your `.env` file:

```env
# Primary key
GOOGLE_API_KEY_1=your_first_key_here

# Additional keys
GOOGLE_API_KEY_2=your_second_key_here
GOOGLE_API_KEY_3=your_third_key_here
GOOGLE_API_KEY_4=your_fourth_key_here

PORT=4000
```

You can add as many keys as needed: `GOOGLE_API_KEY_5`, `GOOGLE_API_KEY_6`, etc.

## How It Works

### Automatic Selection

The server automatically selects the best API key based on:

1. **Non-Rate-Limited**: Prioritizes keys that haven't hit rate limits
2. **Lowest Usage**: Among available keys, chooses the one with lowest usage count
3. **Fair Distribution**: Balances load evenly across all configured keys

### Usage Tracking

- Each key tracks how many times it's been used
- Usage counters reset daily automatically
- When rate-limited, the key is marked and skipped until quota resets

### Automatic Fallback

If a request fails with a rate limit error (429):

1. The current key is marked as rate-limited
2. Server selects the next best available key
3. Request is automatically retried with the new key
4. If successful, the new key processes the request
5. If all keys are rate-limited, error is returned asking to retry later

## Monitor API Key Status

Check the status of all your API keys at any time:

```bash
curl http://localhost:4000/status
```

Response example:

```json
{
  "status": "running",
  "timestamp": "2025-12-15T10:30:00.000Z",
  "totalKeysLoaded": 3,
  "keys": {
    "key1": {
      "configured": true,
      "usageCount": 25,
      "isRateLimited": false,
      "lastReset": "2025-12-15T00:00:00.000Z"
    },
    "key2": {
      "configured": true,
      "usageCount": 28,
      "isRateLimited": false,
      "lastReset": "2025-12-15T00:00:00.000Z"
    },
    "key3": {
      "configured": true,
      "usageCount": 0,
      "isRateLimited": true,
      "lastReset": "2025-12-14T00:00:00.000Z"
    }
  }
}
```

## Understanding the Output

### Fields Explained

- **configured**: Whether this key was found in environment variables
- **usageCount**: Number of times this key has been used today
- **isRateLimited**: Whether the key has hit rate limits (429 error)
- **lastReset**: When the daily usage counter was reset for this key

### Reading the Status

In the example above:
- **key1**: Ready to use, 25 requests today
- **key2**: Ready to use, 28 requests today (will be skipped by selectApiKey due to higher usage)
- **key3**: Rate-limited, 0 requests today (will be skipped until next day)

## Server Logs

When the server is running, you'll see logs like:

```
✅ Loaded 3 API key(s) for load balancing
✅ key2 selected (25 uses) | 1 key(s) rate limited
✅ key2 used successfully. Usage count: 26
```

Or if a key hits rate limit:

```
⚠️ Rate limit hit on key2
🔄 Attempting retry with key3...
✅ Switched to key3. Usage count: 1
```

## Best Practices

### 1. Monitor Usage Regularly

Check `/status` endpoint daily to track usage patterns:

```bash
# Check status with pretty JSON formatting
curl -s http://localhost:4000/status | jq .
```

### 2. Add Keys Proactively

Don't wait until a key is rate-limited. If you see high usage on one key:
- Add another key to distribute load
- Restart the server to load the new environment variables

### 3. Use Free-Tier Keys

Google offers free quota for testing:
- 60 requests per minute per key
- 1500 requests per day per key
- Each account gets one free-tier project

With 3 keys, you could handle:
- 180 requests per minute
- 4500 requests per day

### 4. Track Rate Limit Patterns

Monitor the `/status` endpoint to understand:
- Which time of day has highest usage
- How evenly load is distributed
- When daily resets happen (UTC timezone)

## Troubleshooting

### "No API keys found"

**Problem**: Server starts but shows warning

```
⚠️ No API keys found! Set GOOGLE_API_KEY, GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc in .env
```

**Solution**: 
- Check your `.env` file exists in `ai-server/` folder
- Verify key names: `GOOGLE_API_KEY`, `GOOGLE_API_KEY_1`, `GOOGLE_API_KEY_2`, etc.
- Restart server after adding keys

### "All API keys are rate limited"

**Problem**: Error message when trying to upload

```
All available API keys are rate limited. Please try again in a few moments.
```

**Solution**:
- Wait 1 hour for daily quota to reset
- Add more API keys to your `.env`
- Check `/status` to see when rate limits will clear

### Key Not Being Used

**Problem**: You added a key but it's not being selected

**Solution**:
- Restart the server: `npm start` (it loads env vars at startup)
- Verify the key name in `.env` is correct
- Check `/status` to confirm the key is loaded
- Look for typos: `GOOGLE_API_KEY_2` not `GOOGLE_API_KEY2`

## Environment Variables Cheat Sheet

```env
# Auto-detected (primary key)
GOOGLE_API_KEY=your_key

# Or use numbered format (recommended for multiple keys)
GOOGLE_API_KEY_1=your_first_key
GOOGLE_API_KEY_2=your_second_key
GOOGLE_API_KEY_3=your_third_key

# You can add as many as needed:
GOOGLE_API_KEY_4=your_fourth_key
GOOGLE_API_KEY_5=your_fifth_key

# Other settings
PORT=4000
```

## Integration with Your App

The app already handles API key fallback:

1. App sends request to `/analyze`
2. Server picks best key automatically
3. If rate-limited, server retries with next key
4. Response includes which key was used (for logging)

**No app changes needed!** Just update the server's `.env` file.

## Example: Scaling From 1 to 4 Keys

### Day 1: Single Key
```env
GOOGLE_API_KEY=abc123...
```

### Day 3: Hitting Rate Limits?
```env
GOOGLE_API_KEY_1=abc123...
GOOGLE_API_KEY_2=def456...
```
Restart server. Now 2x capacity!

### Day 7: Still Not Enough?
```env
GOOGLE_API_KEY_1=abc123...
GOOGLE_API_KEY_2=def456...
GOOGLE_API_KEY_3=ghi789...
GOOGLE_API_KEY_4=jkl012...
```
Restart server. Now 4x capacity!

## Technical Details

### Key Selection Algorithm

```
1. Filter out rate-limited keys
2. If all rate-limited, use all keys anyway
3. Sort by usage count (ascending)
4. Select key with lowest count
```

### Usage Counter Reset

- Resets daily at server startup if 24+ hours passed
- Counts increment automatically after each successful request
- Rate limit flag clears on reset

### Rate Limit Detection

Triggers on HTTP 429 response from Google API:
- Marks current key as rate-limited
- Automatically retries with next available key
- Logs the fallback for debugging

---

**Questions?** Check the main `README.md` or test with:
```bash
curl http://localhost:4000/status
```
