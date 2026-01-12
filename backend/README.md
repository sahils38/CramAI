# CramAI Backend

FastAPI backend for processing video lectures into study materials.

## Quick Start

### 1. Prerequisites

- Python 3.9+
- FFmpeg (required for audio extraction)

**Install FFmpeg:**
```bash
# Mac
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 2. Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Groq API key
# Get free key at: https://console.groq.com
```

### 4. Run

```bash
python main.py
```

Server runs at `http://localhost:8000`

- API Docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload video file |
| GET | `/api/status/{task_id}` | Check processing status |
| GET | `/api/results/{task_id}` | Get notes, quiz, audio URL |
| GET | `/api/audio/{task_id}` | Stream voice summary |
| DELETE | `/api/task/{task_id}` | Delete task and files |

## Free Services Used

- **Whisper** (local) - Speech-to-text transcription
- **Groq** (free tier) - AI notes/quiz generation with Llama 3
- **Edge-TTS** (free) - Text-to-speech with Microsoft voices
