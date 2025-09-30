# AI Chatbot Setup Guide

## Overview
The AI chatbot is now connected to Google's Gemini API and provides research-focused assistance for academic publishing, journal recommendations, paper formatting, and submission guidelines.

## Features
- **Research-Focused**: Only responds to queries related to academic research and publishing
- **Context-Aware**: Uses uploaded paper content from the Upload page to provide personalized assistance
- **Real-time AI**: Powered by Google Gemini API for intelligent responses
- **Session Integration**: Automatically accesses paper context from sessionStorage

## Backend Setup

### 1. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

**Note**: Replace `YOUR_API_KEY` in the URL with your actual Gemini API key, or use the format that includes the key in the header (current implementation uses header).

### 2. Get a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Backend Server
```bash
python app.py
```

The backend will run on `http://localhost:8000`

## Frontend Setup

### 1. Configure API Base URL (Optional)
If your backend runs on a different URL, create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Frontend
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## How It Works

### Chat Flow
1. User enters a question in the chat interface
2. Frontend retrieves any uploaded paper context from sessionStorage
3. A research-focused system prompt is constructed with:
   - Instructions to only respond to research-related queries
   - The uploaded paper content (first 3000 characters) if available
   - The user's question
4. The prompt is sent to the backend `/generate` endpoint
5. Backend forwards the request to Gemini API
6. AI response is displayed to the user

### Research-Only Focus
The chatbot includes a system prompt that ensures it:
- Only answers questions related to academic research and publishing
- Provides information about journal recommendations, formatting, and submission guidelines
- Politely redirects off-topic questions back to research topics
- Uses uploaded paper context to provide personalized advice

### Context Integration
- When a user uploads a paper on the Upload page, the content is stored in sessionStorage
- The chatbot automatically accesses this context for relevant questions
- This allows for personalized recommendations based on the actual research content

## API Endpoints

### POST /generate
Generates AI responses using Gemini API.

**Request:**
```json
{
  "prompt": "Your research-focused prompt here"
}
```

**Response:**
```json
{
  "generated_text": "AI-generated response"
}
```

## Troubleshooting

### Backend Issues
- **Error: GEMINI_API_KEY not set**: Ensure `.env` file exists with valid API key
- **Connection refused**: Check if backend is running on port 8000
- **API rate limits**: Gemini API has rate limits; wait and retry

### Frontend Issues
- **No response from chatbot**: Check browser console for errors
- **CORS errors**: Ensure backend CORS is configured (already set to allow all origins)
- **Context not loading**: Verify paper was uploaded successfully on Upload page

## Testing the Chatbot

### Test Questions
1. "What journals would you recommend for my machine learning research?"
2. "How should I format my paper for IEEE publications?"
3. "What are the submission guidelines for Nature journals?"
4. "Can you analyze my uploaded paper and suggest suitable journals?"

### Expected Behavior
- Provides detailed, research-focused responses
- Uses uploaded paper context when available
- Redirects non-research questions politely
- Shows typing indicator while processing

## Security Notes
- Never commit `.env` files to version control
- Keep your Gemini API key secure
- Use environment variables for all sensitive configuration
- Consider implementing rate limiting for production use
