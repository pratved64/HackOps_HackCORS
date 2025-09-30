# Error Resolution: 500 Internal Server Error on /generate

## Error Details
```
:8000/generate:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Error calling Gemini API: Error: API error: 500
```

## Root Cause
The error occurred because:

1. **Missing `.env` file** - The backend requires a `.env` file with the `GEMINI_API_KEY` environment variable
2. **Incorrect API URL format** - The original code had an incorrect header-based authentication approach

## What Was Fixed

### 1. Updated Backend API Endpoint (`backend/app.py`)
- **Removed dependency on `GEMINI_API_URL`** environment variable
- **Hardcoded the correct Gemini API URL** format: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}`
- **Fixed authentication** - Gemini API requires the key as a URL query parameter, not in headers
- **Improved error message** - Now clearly states when the API key is missing
- **Changed model** - Using `gemini-1.5-flash` for faster responses (you can change to `gemini-pro` if needed)

### 2. Updated Environment Configuration
- Simplified `.env.example` to only require `GEMINI_API_KEY`
- Removed the confusing `GEMINI_API_URL` variable

## How to Fix This Error

### Step 1: Get a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated API key (format: `AIza...`)

### Step 2: Create the `.env` File
```bash
cd backend
cp .env.example .env
```

### Step 3: Add Your API Key
Edit the `.env` file and replace `your_gemini_api_key_here` with your actual API key:

```env
GEMINI_API_KEY=AIzaSyABC123YourActualKeyHere456XYZ
```

**Important**: 
- Do NOT include quotes around the key
- Do NOT commit this file to git (it's already in `.gitignore`)
- Keep your API key secure

### Step 4: Restart the Backend Server
```bash
# Stop the current server (Ctrl+C if running)
python app.py
```

You should see:
```
Application started. Gemini AsyncClient initialized.
INFO:     Uvicorn running on http://localhost:8000
```

### Step 5: Test the Chatbot
1. Open the frontend at `http://localhost:3000`
2. Navigate to the Chat page
3. Ask a research-related question like: "What are the best practices for submitting to IEEE journals?"
4. You should receive an AI-generated response

## Verification Checklist

- [ ] `.env` file exists in `backend/` directory
- [ ] `GEMINI_API_KEY` is set with a valid API key (starts with `AIza`)
- [ ] Backend server restarted after creating `.env`
- [ ] No 500 errors in browser console
- [ ] Chatbot responds to messages

## Common Issues After Fix

### Issue: Still getting 500 error
**Solution**: 
- Check that the `.env` file is in the correct location (`backend/.env`)
- Verify the API key is valid by testing it directly: 
  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
  ```

### Issue: "API key not valid" error
**Solution**: 
- Your API key might be invalid or expired
- Generate a new key from Google AI Studio
- Ensure you're using the Gemini API, not other Google Cloud APIs

### Issue: Rate limit errors
**Solution**: 
- Gemini API has rate limits (free tier: 60 requests per minute)
- Wait a minute and try again
- Consider upgrading to a paid tier if needed

### Issue: Content blocked by safety filters
**Solution**: 
- Gemini has built-in safety filters
- Ensure your prompts are appropriate and research-focused
- The error message will indicate the block reason in the console

## Technical Details

### Gemini API Request Format
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

### Gemini API Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Generated response here"
          }
        ]
      }
    }
  ]
}
```

### Available Gemini Models
- `gemini-1.5-flash` - Fast, efficient (currently used)
- `gemini-1.5-pro` - More capable, slower
- `gemini-pro` - Legacy model

To change the model, edit line 193 in `backend/app.py`:
```python
api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_KEY}"
```

## Need More Help?

- **Gemini API Documentation**: https://ai.google.dev/docs
- **API Key Management**: https://makersuite.google.com/app/apikey
- **Rate Limits**: https://ai.google.dev/pricing
- **Backend Logs**: Check the terminal where `python app.py` is running for detailed error messages
