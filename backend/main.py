from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import PyPDF2
import io
import os
from dotenv import load_dotenv
import sys
import asyncio
import hashlib
import time
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add parent directory to path to import job_search
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from job_search import JobSearcher
import groq

load_dotenv()

app = FastAPI(title="Agragrati API", version="1.0.0")

# Thread pool for running sync operations
executor = ThreadPoolExecutor(max_workers=4)

# Simple in-memory cache with TTL
class SimpleCache:
    def __init__(self, ttl_seconds: int = 300):  # 5 minute default TTL
        self._cache = {}
        self._ttl = ttl_seconds
    
    def _hash_key(self, key: str) -> str:
        return hashlib.md5(key.encode()).hexdigest()
    
    def get(self, key: str):
        hashed = self._hash_key(key)
        if hashed in self._cache:
            value, timestamp = self._cache[hashed]
            if time.time() - timestamp < self._ttl:
                logger.info(f"Cache hit for key: {hashed[:8]}...")
                return value
            else:
                del self._cache[hashed]  # Expired
        return None
    
    def set(self, key: str, value):
        hashed = self._hash_key(key)
        self._cache[hashed] = (value, time.time())
        # Limit cache size to prevent memory issues
        if len(self._cache) > 100:
            # Remove oldest entries
            sorted_items = sorted(self._cache.items(), key=lambda x: x[1][1])
            for old_key, _ in sorted_items[:20]:
                del self._cache[old_key]
    
    def clear(self):
        self._cache.clear()

# Initialize caches
resume_analysis_cache = SimpleCache(ttl_seconds=600)  # 10 min for resume analysis
career_insights_cache = SimpleCache(ttl_seconds=900)  # 15 min for career insights
interview_questions_cache = SimpleCache(ttl_seconds=600)  # 10 min for interview questions

# Configuration
AI_TIMEOUT_SECONDS = int(os.getenv("AI_TIMEOUT_SECONDS", "60"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))

app = FastAPI(title="Agragrati API", version="1.0.0")

# CORS configuration - supports environment-based origins for production
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000",   # Production/Docker
    "http://localhost:3001",   # Alternate port
    "http://localhost:5173",   # Vite dev server
    "http://localhost:5174",   # Vite alternate port
    "http://localhost:8080",   # Alternate dev port
    "http://127.0.0.1:5173",   # Vite dev server alt
    "http://127.0.0.1:3000",   # Alt localhost
    "http://127.0.0.1:8080",   # Alt localhost
]
# Add production frontend URL if set
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)
    # Also allow www subdomain if applicable
    if FRONTEND_URL.startswith("https://"):
        allowed_origins.append(FRONTEND_URL.replace("https://", "https://www."))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in environment variables")

job_searcher = JobSearcher(GROQ_API_KEY)
groq_client = groq.Client(api_key=GROQ_API_KEY)


# Helper function for AI calls with timeout and retry
async def call_groq_with_timeout(
    messages: List[dict],
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    timeout: int = None,
    retries: int = None
) -> str:
    """
    Call Groq API with timeout and retry logic.
    
    Args:
        messages: List of message dicts for the chat
        model: Model to use
        temperature: Temperature for generation
        max_tokens: Max tokens to generate
        timeout: Timeout in seconds (default: AI_TIMEOUT_SECONDS)
        retries: Number of retries (default: MAX_RETRIES)
    
    Returns:
        Generated text content
    
    Raises:
        HTTPException on timeout or API errors
    """
    timeout = timeout or AI_TIMEOUT_SECONDS
    retries = retries or MAX_RETRIES
    
    def _sync_call():
        return groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
    
    last_error = None
    for attempt in range(retries + 1):
        try:
            logger.info(f"Groq API call attempt {attempt + 1}/{retries + 1}")
            
            # Run sync call in thread pool with timeout
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(executor, _sync_call),
                timeout=timeout
            )
            
            content = response.choices[0].message.content
            if content:
                logger.info(f"Groq API call successful, response length: {len(content)}")
                return content.strip()
            else:
                raise ValueError("Empty response from Groq API")
                
        except asyncio.TimeoutError:
            last_error = f"AI request timed out after {timeout} seconds"
            logger.warning(f"Attempt {attempt + 1} timed out")
            if attempt < retries:
                await asyncio.sleep(1)  # Brief pause before retry
                
        except groq.RateLimitError as e:
            last_error = "Rate limit exceeded. Please try again in a moment."
            logger.warning(f"Rate limit hit: {e}")
            if attempt < retries:
                await asyncio.sleep(2)  # Longer pause for rate limits
                
        except groq.APIError as e:
            last_error = f"AI service error: {str(e)}"
            logger.error(f"Groq API error: {e}")
            if attempt < retries:
                await asyncio.sleep(1)
                
        except Exception as e:
            last_error = f"Unexpected error: {str(e)}"
            logger.error(f"Unexpected error in Groq call: {e}")
            break  # Don't retry on unexpected errors
    
    raise HTTPException(status_code=503, detail=last_error)


# Pydantic models
class JobSearchRequest(BaseModel):
    search_term: str
    location: str = "United States"
    results_wanted: int = 20
    job_type: Optional[str] = None

class ResumeJobSearchRequest(BaseModel):
    resume_text: str
    location: str = "United States"
    results_wanted: int = 20
    job_type: Optional[str] = None

class CareerInsightsRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None

class SalaryInsightsRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None
    location: str = "United States"

class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str

class AnalyzeResumeRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None

# New Feature Models
class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    company_name: str
    job_description: Optional[str] = None
    tone: str = "professional"
    additional_info: Optional[str] = None

class InterviewQuestionsRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    target_role: Optional[str] = None

class EnhanceResumeSectionRequest(BaseModel):
    section_type: str
    content: str
    target_role: Optional[str] = None


# Helper functions
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF bytes"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")


# API Routes
@app.get("/")
async def root():
    return {
        "message": "Agragrati API - AI Resume & Job Search",
        "version": "1.0.0",
        "endpoints": [
            "/analyze-resume",
            "/search-jobs",
            "/search-jobs-by-resume",
            "/career-insights/*",
            "/job-match"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "groq_api": "connected" if GROQ_API_KEY else "missing"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and extract text from resume"""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_content = await file.read()
    
    if file.filename.endswith('.pdf'):
        resume_text = extract_text_from_pdf(file_content)
    elif file.filename.endswith('.txt'):
        resume_text = file_content.decode('utf-8')
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or TXT")
    
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="File is empty or contains no text")
    
    return {"resume_text": resume_text, "filename": file.filename}


@app.post("/analyze-resume")
async def analyze_resume(request: AnalyzeResumeRequest):
    """Analyze resume and provide feedback with caching and timeout handling"""
    try:
        job_role = request.target_role if request.target_role else "general job applications"
        
        # Check cache first
        cache_key = f"analyze:{job_role}:{request.resume_text[:500]}"
        cached_result = resume_analysis_cache.get(cache_key)
        if cached_result:
            logger.info("Returning cached resume analysis")
            return cached_result
        
        prompt = f"""
You are an expert resume reviewer and career consultant with 15+ years of experience in talent acquisition and HR. 
Analyze the following resume and provide comprehensive, actionable feedback for {job_role}.

**ANALYSIS FRAMEWORK:**
Please structure your response with the following sections:

1. **OVERALL IMPRESSION** (1-2 sentences)
- First impression and general quality assessment

2. **STRENGTHS** 
- What works well in this resume
- Standout achievements or experiences

3. **AREAS FOR IMPROVEMENT**
- Content gaps or weaknesses
- Formatting and presentation issues
- Missing key information

4. **SPECIFIC RECOMMENDATIONS**
- Concrete suggestions for improvement
- Industry-specific advice for {job_role}
- Keywords and skills to consider adding

5. **ACTION ITEMS** 
- Priority fixes (High/Medium/Low)
- Quick wins that can be implemented immediately

6. **FINAL SCORE** 
- Rate the resume from 1-10 with brief justification

**RESUME CONTENT:**
{request.resume_text}

**INSTRUCTIONS:**
- Be honest but constructive in your feedback
- Provide specific examples from the resume when pointing out issues
- Consider ATS (Applicant Tracking System) compatibility
- Focus on relevance to {job_role}
- Suggest specific metrics, action verbs, and formatting improvements
- Keep feedback actionable and prioritized
"""
        
        # Use helper with timeout and retry
        analysis = await call_groq_with_timeout(
            messages=[
                {"role": "system", "content": "You are an expert resume reviewer with years of experience in HR and recruitment."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        result = {
            "analysis": analysis,
            "target_role": request.target_role
        }
        
        # Cache the result
        resume_analysis_cache.set(cache_key, result)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")


@app.post("/search-jobs")
async def search_jobs(request: JobSearchRequest):
    """Search for jobs based on search term"""
    try:
        jobs_df = job_searcher.search_jobs(
            request.search_term,
            request.location,
            request.results_wanted,
            request.job_type
        )
        
        if jobs_df.empty:
            return {"jobs": [], "count": 0}
        
        return {
            "jobs": jobs_df.to_dict('records'),
            "count": len(jobs_df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")


@app.post("/search-jobs-by-resume")
async def search_jobs_by_resume(request: ResumeJobSearchRequest):
    """Search for jobs based on resume content"""
    try:
        jobs_df = job_searcher.search_jobs_by_resume(
            request.resume_text,
            request.location,
            request.results_wanted,
            request.job_type
        )
        
        if jobs_df.empty:
            return {"jobs": [], "count": 0}
        
        return {
            "jobs": jobs_df.to_dict('records'),
            "count": len(jobs_df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs by resume: {str(e)}")


@app.post("/career-insights/paths")
async def get_career_paths(request: CareerInsightsRequest):
    """Get career path analysis with caching"""
    try:
        # Check cache
        cache_key = f"paths:{request.target_role}:{request.resume_text[:300]}"
        cached = career_insights_cache.get(cache_key)
        if cached:
            logger.info("Returning cached career paths")
            return cached
        
        result = job_searcher.get_career_path_analysis(
            request.resume_text,
            request.target_role
        )
        
        # Cache result
        career_insights_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Error getting career paths: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting career paths: {str(e)}")


@app.post("/career-insights/skill-gaps")
async def get_skill_gaps(request: CareerInsightsRequest):
    """Get skill gap analysis with caching"""
    try:
        cache_key = f"skills:{request.target_role}:{request.resume_text[:300]}"
        cached = career_insights_cache.get(cache_key)
        if cached:
            logger.info("Returning cached skill gaps")
            return cached
        
        result = job_searcher.get_skill_gap_analysis(
            request.resume_text,
            request.target_role
        )
        
        career_insights_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Error analyzing skill gaps: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing skill gaps: {str(e)}")


@app.post("/career-insights/salary")
async def get_salary_insights(request: SalaryInsightsRequest):
    """Get salary insights with caching"""
    try:
        cache_key = f"salary:{request.target_role}:{request.location}:{request.resume_text[:300]}"
        cached = career_insights_cache.get(cache_key)
        if cached:
            logger.info("Returning cached salary insights")
            return cached
        
        result = job_searcher.get_salary_insights(
            request.resume_text,
            request.target_role,
            request.location
        )
        
        career_insights_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Error getting salary insights: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting salary insights: {str(e)}")


@app.post("/career-insights/interview-prep")
async def get_interview_prep(request: CareerInsightsRequest):
    """Get interview preparation guidance with caching"""
    try:
        cache_key = f"interview:{request.target_role}:{request.resume_text[:300]}"
        cached = career_insights_cache.get(cache_key)
        if cached:
            logger.info("Returning cached interview prep")
            return cached
        
        result = job_searcher.get_interview_preparation(
            request.resume_text,
            request.target_role
        )
        
        career_insights_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Error getting interview prep: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting interview prep: {str(e)}")


@app.post("/career-insights/learning")
async def get_learning_recommendations(request: CareerInsightsRequest):
    """Get learning recommendations with caching"""
    try:
        cache_key = f"learning:{request.target_role}:{request.resume_text[:300]}"
        cached = career_insights_cache.get(cache_key)
        if cached:
            logger.info("Returning cached learning recommendations")
            return cached
        
        result = job_searcher.get_learning_recommendations(
            request.resume_text,
            request.target_role
        )
        
        career_insights_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Error getting learning recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting learning recommendations: {str(e)}")


@app.post("/career-insights/industry")
async def get_industry_insights(request: CareerInsightsRequest):
    """Get industry insights and trends with caching"""
    try:
        cache_key = f"industry:{request.target_role}:{request.resume_text[:300]}"
        cached = career_insights_cache.get(cache_key)
        if cached:
            logger.info("Returning cached industry insights")
            return cached
        
        result = job_searcher.get_industry_insights(
            request.resume_text,
            request.target_role
        )
        
        career_insights_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Error getting industry insights: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting industry insights: {str(e)}")


@app.post("/job-match")
async def match_resume_to_job(request: JobMatchRequest):
    """Match resume against job description"""
    try:
        result = job_searcher.match_resume_to_job(
            request.resume_text,
            request.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching resume to job: {str(e)}")


# ==========================================
# NEW FEATURE ENDPOINTS
# ==========================================

@app.post("/generate-cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate a personalized cover letter with timeout handling"""
    try:
        tone_descriptions = {
            "professional": "formal and professional",
            "enthusiastic": "enthusiastic and energetic",
            "confident": "confident and assertive",
            "creative": "creative and unique",
            "formal": "very formal and traditional"
        }
        tone_desc = tone_descriptions.get(request.tone, "professional")
        
        job_desc_section = ""
        if request.job_description:
            job_desc_section = f"\n\n**JOB DESCRIPTION:**\n{request.job_description}"
        
        additional_section = ""
        if request.additional_info:
            additional_section = f"\n\n**ADDITIONAL POINTS TO MENTION:**\n{request.additional_info}"
        
        prompt = f"""Generate a compelling cover letter for the following position.

**TARGET POSITION:** {request.job_title} at {request.company_name}
**TONE:** {tone_desc}{job_desc_section}{additional_section}

**RESUME:**
{request.resume_text}

**INSTRUCTIONS:**
1. Write a personalized cover letter (3-4 paragraphs)
2. Highlight relevant experience from the resume
3. Show enthusiasm for the specific company and role
4. Include specific achievements with metrics when possible
5. Make it {tone_desc}
6. Keep it concise but impactful
7. Do NOT include placeholder brackets - write complete sentences

Output ONLY the cover letter text, ready to use."""

        cover_letter = await call_groq_with_timeout(
            messages=[
                {"role": "system", "content": "You are an expert career coach and professional writer specializing in compelling cover letters."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return {"cover_letter": cover_letter}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating cover letter: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating cover letter: {str(e)}")


@app.post("/interview-questions")
async def get_interview_questions(request: InterviewQuestionsRequest):
    """Generate personalized interview questions with caching and timeout handling"""
    try:
        role = request.target_role or "general"
        
        # Create cache key from role + resume hash (first 500 chars for efficiency)
        resume_snippet = request.resume_text[:500] if request.resume_text else ""
        cache_key = f"interview_questions:{role}:{resume_snippet}"
        
        # Check cache first
        cached_result = interview_questions_cache.get(cache_key)
        if cached_result:
            return cached_result
        
        prompt = f"""Based on this resume, generate 10 realistic interview questions that this candidate is likely to face.

**RESUME:**
{request.resume_text}

**TARGET ROLE:** {role}

For each question, provide:
1. The question itself
2. Category (Technical, Behavioral, Situational, Experience, Culture Fit)
3. Difficulty (Easy, Medium, Hard)
4. 2-3 tips for answering well

Return as JSON array:
[
  {{
    "question": "...",
    "category": "...",
    "difficulty": "...",
    "tips": ["...", "..."]
  }}
]

Include a mix of:
- Behavioral questions (STAR method applicable)
- Technical questions based on their skills
- Role-specific questions
- Common questions about their experience

Output ONLY valid JSON, no markdown."""

        response_text = await call_groq_with_timeout(
            messages=[
                {"role": "system", "content": "You are an experienced hiring manager and interview coach. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        import json
        # Try to extract JSON from response
        try:
            questions = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to find JSON array in response
            import re
            match = re.search(r'\[[\s\S]*\]', response_text)
            if match:
                questions = json.loads(match.group())
            else:
                raise
        
        result = {"questions": questions}
        interview_questions_cache.set(cache_key, result)
        return result
    except json.JSONDecodeError:
        logger.error("Failed to parse interview questions JSON")
        raise HTTPException(status_code=500, detail="Failed to parse interview questions")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating interview questions: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating interview questions: {str(e)}")


@app.post("/evaluate-answer")
async def evaluate_answer(request: EvaluateAnswerRequest):
    """Evaluate an interview answer with timeout handling"""
    try:
        role_context = f"for a {request.target_role} position" if request.target_role else ""
        
        prompt = f"""Evaluate this interview answer {role_context}.

**QUESTION:** {request.question}

**CANDIDATE'S ANSWER:** {request.answer}

Provide evaluation as JSON:
{{
  "score": <1-10>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "sample_answer": "A strong sample answer for comparison..."
}}

Be constructive and specific. Output ONLY valid JSON."""

        response_text = await call_groq_with_timeout(
            messages=[
                {"role": "system", "content": "You are an experienced interviewer providing constructive feedback. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        import json
        try:
            evaluation = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to find JSON object in response
            import re
            match = re.search(r'\{[\s\S]*\}', response_text)
            if match:
                evaluation = json.loads(match.group())
            else:
                raise
        
        return evaluation
    except json.JSONDecodeError:
        logger.error("Failed to parse evaluation JSON")
        raise HTTPException(status_code=500, detail="Failed to parse evaluation")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")


@app.post("/enhance-resume-section")
async def enhance_resume_section(request: EnhanceResumeSectionRequest):
    """Enhance a resume section with AI and timeout handling"""
    try:
        role_context = f"for a {request.target_role} position" if request.target_role else ""
        
        section_guidance = {
            "summary": "Create a compelling 2-3 sentence professional summary highlighting key achievements and career goals",
            "experience": "Enhance with action verbs, specific metrics, and quantifiable achievements. Use bullet points.",
            "skills": "Organize skills by category, prioritize relevant skills, add proficiency levels if appropriate",
            "education": "Highlight relevant coursework, honors, GPA if strong, relevant projects",
            "projects": "Emphasize technologies used, your specific role, and measurable impact",
            "achievements": "Focus on quantifiable results and recognition",
            "certifications": "List with dates, issuing organizations, and relevance"
        }
        
        guidance = section_guidance.get(request.section_type, "Enhance for clarity, impact, and professionalism")
        
        prompt = f"""Enhance this resume {request.section_type} section {role_context}.

**ORIGINAL CONTENT:**
{request.content}

**GUIDELINES:**
{guidance}

**INSTRUCTIONS:**
1. Improve the wording and structure
2. Add metrics and specifics where possible
3. Use strong action verbs
4. Make it ATS-friendly
5. Keep the same general information but make it more impactful

Output ONLY the enhanced content, ready to paste into a resume. No explanations or labels."""

        response_text = await call_groq_with_timeout(
            messages=[
                {"role": "system", "content": "You are an expert resume writer. Enhance content to be more impactful and professional."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return {"enhanced_content": response_text}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enhancing resume section: {e}")
        raise HTTPException(status_code=500, detail=f"Error enhancing resume section: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
