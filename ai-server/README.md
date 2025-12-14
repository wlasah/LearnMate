LearnMate AI server

This small Express server extracts text from uploaded PDFs and (optionally) calls the Google Generative API to produce summaries, quizzes, flashcards, or practice questions.

Setup

1. Install dependencies:

```bash
cd ai-server
npm install
```

2. Create a `.env` file in `ai-server/` with your API key(s) (optional):

```
# Single key (primary)
GOOGLE_API_KEY=your_api_key_here

# OR Multiple keys for load balancing and redundancy
GOOGLE_API_KEY_1=first_api_key_here
GOOGLE_API_KEY_2=second_api_key_here
GOOGLE_API_KEY_3=third_api_key_here
GOOGLE_API_KEY_4=fourth_api_key_here
# Add as many as needed: GOOGLE_API_KEY_5, GOOGLE_API_KEY_6, etc.

PORT=4000
```

3. Start the server:

```bash
npm start
```

Endpoints

- `POST /analyze` (multipart form-data)
  - file field name: `file` (PDF)
  - text field: `method` (one of `quiz`, `summary`, `flashcards`, `practice`)
  - text field: `quantity` (1-5 for summaries, optional)
  - text field: `difficulty` (easy|medium|hard for quizzes/practice, optional)

- `GET /status`
  - Check all API keys' usage and rate-limit status

## Multi-API Key Features

- **Automatic Load Balancing**: The server tracks usage for each API key and automatically switches to the key with the lowest usage
- **Graceful Fallback**: If an API key hits rate limits, the server automatically switches to the next available key
- **Usage Tracking**: Daily usage counters reset automatically, preventing quota conflicts
- **Monitor Status**: Use the `/status` endpoint to check all keys' usage and rate-limit status

### Check API Key Status

```bash
curl http://localhost:4000/status
```

Response shows:
- Total keys loaded
- Usage count for each key
- Rate-limit status
- Last reset time

Response

- If no `GOOGLE_API_KEY*` is set: returns `extractedText` and the `prompt` you'd send the AI.
- If `GOOGLE_API_KEY*` is set: returns `extractedText` and `ai` (AI-generated output).
- On successful fallback: includes `keyUsed` field showing which key processed the request

Error Handling

- **429 (Rate Limited)**: Server attempts to switch to another available key. If all keys are rate-limited, returns an error asking to retry later.
- **500 (Server Error)**: General server errors are logged and returned with details.

Notes

- Keep your API key out of the client. Set it in the server's environment (.env or host provider secrets).
- This server is a minimal proof-of-concept. For production, add authentication, rate limiting, and robust error handling.
