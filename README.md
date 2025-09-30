# HackOps_HackCORS - AI Research Assistant

An intelligent research assistant platform that helps researchers find suitable journals, format papers, and get AI-powered guidance on academic publishing.

## Features

### 1. **Journal Recommendation System**
- Upload research papers (PDF, DOCX, or text)
- AI-powered semantic search using SciBERT embeddings
- ChromaDB vector database for efficient journal matching
- Top 5 journal recommendations based on paper content

### 2. **AI Chatbot Assistant**
- Powered by Google Gemini API
- Research-focused conversations only
- Context-aware responses using uploaded paper content
- Assistance with:
  - Journal recommendations
  - Paper formatting guidelines
  - Submission processes
  - Publication strategies

### 3. **Modern UI/UX**
- Built with Next.js and React
- Responsive design with Tailwind CSS
- Dark mode support
- Beautiful glassmorphism effects

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file with your API keys
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Documentation

- **[Chatbot Setup Guide](./CHATBOT_SETUP.md)** - Detailed instructions for configuring the AI chatbot
- **[Backend API](./backend/app.py)** - FastAPI backend with SciBERT and Gemini integration
- **[Frontend](./frontend/)** - Next.js application with modern UI

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SciBERT** - Scientific text embeddings
- **ChromaDB** - Vector database for semantic search
- **Google Gemini API** - AI-powered chatbot
- **PyTorch** - Deep learning framework

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Lucide Icons** - Modern icon library

## Project Structure
```
HackOps_HackCORS/
├── backend/
│   ├── app.py              # FastAPI server with all endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── app/
│   │   ├── chat/          # AI chatbot page
│   │   ├── upload/        # Paper upload & journal search
│   │   └── page.tsx       # Landing page
│   ├── components/        # Reusable UI components
│   └── env.example        # Frontend environment variables
├── notebooks/
│   └── pipeline.py        # Data processing pipeline
└── CHATBOT_SETUP.md       # Chatbot configuration guide
```

## API Endpoints

### POST /search_journals
Search for relevant journals based on paper content.
```json
{
  "text": "Your paper abstract or content",
  "top_n": 5
}
```

### POST /generate
Generate AI responses using Gemini API.
```json
{
  "prompt": "Your research question"
}
```

## Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
CHROMA_API_KEY=your_chroma_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Contributing

This project was developed for HackOps. Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your research needs.
