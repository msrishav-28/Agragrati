# Agragrati Backend

FastAPI backend for the Agragrati AI Career Platform.

## Tech Stack

- **FastAPI** - Web framework
- **Python 3.11+** - Runtime
- **Pydantic** - Data validation
- **Groq** - AI inference (Llama 3.3 70B)
- **PyPDF2** - PDF parsing

## Quick Start

```bash
# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Add your GROQ_API_KEY

# Start server
uvicorn main:app --reload --port 8000
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key | Yes |
| `RAPIDAPI_KEY` | JSearch API key | Optional |
| `ADZUNA_APP_ID` | Adzuna app ID | Optional |
| `ADZUNA_APP_KEY` | Adzuna app key | Optional |
| `FRONTEND_URL` | Frontend URL (CORS) | Production |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload-resume` | POST | Upload PDF/TXT resume |
| `/analyze-resume` | POST | AI resume analysis |
| `/search-jobs` | POST | Manual job search |
| `/search-jobs-by-resume` | POST | AI-powered job search |
| `/career-insights/paths` | POST | Career paths |
| `/career-insights/skill-gaps` | POST | Skill gaps |
| `/career-insights/salary` | POST | Salary insights |
| `/career-insights/interview-prep` | POST | Interview prep |
| `/career-insights/learning` | POST | Learning resources |
| `/career-insights/industry` | POST | Industry trends |
| `/job-match` | POST | Resume-job matching |
| `/generate-cover-letter` | POST | Cover letter generation |
| `/interview-questions` | POST | Interview questions |
| `/evaluate-answer` | POST | Answer evaluation |
| `/enhance-resume-section` | POST | Resume enhancement |

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Deployment

### Vercel Serverless

See [vercel.json](./vercel.json) for configuration.

### Docker

```bash
docker build -t agragrati-backend .
docker run -p 8000:8000 --env-file .env agragrati-backend
```

### Render

- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Project Structure

```
backend/
├── main.py       # FastAPI application
├── requirements.txt   # Python dependencies
├── vercel.json     # Vercel config
└── Dockerfile     # Docker config

# Parent directory
../job_search.py    # Core AI & job search logic
```

## Development

```bash
# Run with auto-reload
uvicorn main:app --reload --port 8000

# Check API
curl http://localhost:8000/health

# View logs in terminal
```

## Rate Limits

| API | Free Tier |
|-----|-----------|
| Groq | 30 req/min, 6000/day |
| JSearch | 500 req/month |
| Adzuna | 5000 req/month |
