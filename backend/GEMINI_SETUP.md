# Gemini API Setup

The backend has been updated to use **Gemini API** instead of OpenAI.

## Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_TIMEOUT_HOURS=24

# Gemini API Configuration (for AI guidance)
GEMINI_API_KEY=AIzaSyBtf82wpBU7M8ikZ9V4R-GhLFinpwSDc-w
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

## Changes Made

1. ✅ Updated `backend/src/utils/aiGuidance.ts` to use Gemini REST API
2. ✅ Updated `backend/src/routes/ai.ts` to read `GEMINI_API_KEY` and `GEMINI_URL`
3. ✅ Installed `@google/generative-ai` package (not needed for REST API, but available)
4. ✅ Updated README.md to reflect Gemini usage

## How It Works

- Uses Gemini 2.5 Flash model via REST API
- API key is passed as a query parameter: `?key=${GEMINI_API_KEY}`
- Falls back to rule-based guidance if API key is missing or invalid
- System instruction and user prompt are combined into a single text prompt

## Testing

After setting up the `.env` file, restart your backend server:

```bash
cd backend
npm run dev
```

The AI guidance will now use Gemini instead of OpenAI!


