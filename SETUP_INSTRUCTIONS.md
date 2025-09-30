# Complete Setup Instructions

## Current Error: ERR_CONNECTION_REFUSED

This error means the backend server is not running. Follow these steps to fix it:

## Step-by-Step Setup

### 1. Get Your Gemini API Key (REQUIRED)

**You MUST have a real API key for the chatbot to work.**

1. Visit: **https://makersuite.google.com/app/apikey** (or https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the entire key (it will look like: `AIzaSyABC123def456GHI789jkl012MNO345pqr`)

### 2. Configure the Backend

Open the file: `backend/.env` and replace the placeholder with your actual API key:

```env
# Gemini API Configuration
GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

**Important:**
- Replace `AIzaSyABC123def456GHI789jkl012MNO345pqr` with YOUR actual key
- Do NOT use quotes around the key
- Do NOT leave it as `your_gemini_api_key_here` or `AIzaSyYourActualKeyHere`

### 3. Start the Backend Server

```bash
cd backend
python app.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://localhost:8000
Application started. Gemini AsyncClient initialized.
INFO:     Application startup complete.
```

**If you see an error about the API key being a placeholder:**
- Go back to step 2 and make sure you replaced the placeholder with your REAL API key
- Restart the server

### 4. Start the Frontend (in a NEW terminal)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### 5. Test the Chatbot

1. Open your browser to: **http://localhost:3000**
2. Click on **"Chat"** in the navigation
3. Type a question like: **"What are the best journals for machine learning research?"**
4. Press Enter

**Expected behavior:**
- You should see a typing indicator
- After a few seconds, you'll get an AI-generated response
- The backend terminal will show: `[Gemini] Successfully generated X characters`

## Troubleshooting

### Error: "GEMINI_API_KEY is still set to placeholder value"

**Solution:** You haven't replaced the placeholder in the `.env` file with your actual API key.

1. Open `backend/.env`
2. Replace `your_gemini_api_key_here` with your real API key from Google AI Studio
3. Save the file
4. Restart the backend server

### Error: "Invalid Gemini API key"

**Solution:** The API key you entered is incorrect or expired.

1. Go to https://makersuite.google.com/app/apikey
2. Delete the old key and create a new one
3. Copy the new key to `backend/.env`
4. Restart the backend server

### Error: ERR_CONNECTION_REFUSED

**Solution:** The backend server is not running.

1. Open a terminal
2. Run: `cd backend && python app.py`
3. Keep this terminal open
4. The frontend should now be able to connect

### Error: "Rate limit exceeded"

**Solution:** You've made too many requests.

- Free tier: 60 requests per minute
- Wait 1 minute and try again
- Consider upgrading to a paid tier if needed

### Backend starts but chatbot doesn't respond

**Check the backend terminal for error messages:**

1. Look for lines starting with `[Gemini]`
2. Common issues:
   - API key invalid: Get a new key
   - Network error: Check your internet connection
   - Content blocked: Your prompt may have triggered safety filters

## Verification Checklist

Before asking for help, verify:

- [ ] Backend server is running (you see "Application startup complete")
- [ ] Frontend is running (you can access http://localhost:3000)
- [ ] `.env` file exists in `backend/` directory
- [ ] `GEMINI_API_KEY` in `.env` is a real API key (starts with `AIza` and is ~39 characters)
- [ ] No errors in the backend terminal
- [ ] Browser console shows no ERR_CONNECTION_REFUSED errors

## Quick Test Command

To verify your API key works, run this in the backend directory:

```bash
python -c "
from dotenv import load_dotenv
import os
import httpx

load_dotenv()
key = os.getenv('GEMINI_API_KEY')

if not key or key in ['your_gemini_api_key_here', 'AIzaSyYourActualKeyHere']:
    print('❌ API key is not set or is still a placeholder')
    print('Please edit backend/.env and add your real API key')
else:
    print(f'✓ API key found: {key[:10]}...{key[-4:]}')
    print('Testing API key...')
    
    url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}'
    payload = {'contents': [{'parts': [{'text': 'Hello'}]}]}
    
    try:
        response = httpx.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print('✓ API key is valid and working!')
        else:
            print(f'❌ API error: {response.status_code}')
            print(response.text)
    except Exception as e:
        print(f'❌ Error: {e}')
"
```

## Need More Help?

1. **Check backend logs** - Look at the terminal where `python app.py` is running
2. **Check browser console** - Press F12 in your browser and look for errors
3. **Verify API key** - Make sure it's a real key from Google AI Studio
4. **Check the ERROR_RESOLUTION.md** file for more detailed troubleshooting

## Architecture Overview

```
User Browser (localhost:3000)
    ↓
Frontend (Next.js)
    ↓ HTTP POST /generate
Backend (FastAPI - localhost:8000)
    ↓ HTTPS POST with API key
Google Gemini API
    ↓ AI Response
Backend
    ↓ JSON response
Frontend
    ↓ Display
User sees AI response
```

## Important Notes

- **Never commit your `.env` file** - It contains your secret API key
- **Keep your API key secure** - Don't share it publicly
- **Free tier limits** - 60 requests/minute, 1500 requests/day
- **The chatbot only responds to research-related questions** - This is by design
