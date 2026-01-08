// API Service Layer for Agragrati Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface Job {
  "Job Title": string;
  Company: string;
  Location: string;
  "Job Type": string;
  Salary: string;
  "Date Posted": string;
  "Apply Link": string;
  Source: string;
}

export interface JobSearchResponse {
  jobs: Job[];
  count: number;
}

export interface ResumeAnalysisResponse {
  analysis: string;
  target_role: string | null;
}

export interface UploadResumeResponse {
  resume_text: string;
  filename: string;
}

export interface CareerPath {
  path_name: string;
  description: string;
  next_role: string;
  timeline: string;
  requirements: string[];
}

export interface CareerPathsResponse {
  current_level: string;
  strengths_for_growth: string[];
  growth_areas: string[];
  career_paths: CareerPath[];
  error?: string;
}

export interface SkillGap {
  skill: string;
  priority: string;
  importance: string;
  how_to_acquire: string;
}

export interface SkillGapsResponse {
  match_percentage: number;
  current_skills: {
    technical: string[];
    soft: string[];
  };
  required_skills: {
    technical: string[];
    soft: string[];
  };
  skill_gaps: SkillGap[];
  error?: string;
}

export interface SalaryInsightsResponse {
  estimated_current_value: {
    low: number;
    mid: number;
    high: number;
  };
  market_rate: {
    entry_level: { low: number; high: number };
    mid_level: { low: number; high: number };
    senior_level: { low: number; high: number };
    lead_level: { low: number; high: number };
  };
  factors_affecting_salary: Array<{
    factor: string;
    impact: string;
    details: string;
  }>;
  negotiation_tips: string[];
  error?: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  suggested_approach: string;
  resume_points_to_highlight: string[];
}

export interface InterviewPrepResponse {
  likely_questions: InterviewQuestion[];
  stories_to_prepare: Array<{
    situation: string;
    applicable_questions: string[];
  }>;
  technical_topics_to_review: string[];
  questions_to_ask_interviewer: string[];
  red_flags_to_address: Array<{
    concern: string;
    how_to_address: string;
  }>;
  error?: string;
}

export interface LearningResource {
  title: string;
  platform: string;
  skill_covered: string;
  estimated_duration: string;
  priority: string;
}

export interface LearningResponse {
  courses: LearningResource[];
  certifications: Array<{
    name: string;
    provider: string;
    value: string;
    difficulty: string;
    estimated_prep_time: string;
  }>;
  books: Array<{
    title: string;
    author: string;
    why_recommended: string;
  }>;
  projects_to_build: Array<{
    project: string;
    skills_demonstrated: string[];
    portfolio_value: string;
  }>;
  communities_to_join: string[];
  error?: string;
}

export interface IndustryInsightsResponse {
  relevant_industries: string[];
  market_outlook: {
    demand: string;
    competition: string;
    summary: string;
  };
  industry_trends: Array<{
    trend: string;
    impact: string;
    opportunity: string;
  }>;
  emerging_roles: Array<{
    role: string;
    description: string;
    fit_score: string;
  }>;
  companies_to_target: Array<{
    company_type: string;
    examples: string[];
    why_good_fit: string;
  }>;
  error?: string;
}

export interface JobMatchResponse {
  match_score: number;
  match_level: string;
  summary: string;
  skills_breakdown: {
    technical_skills: {
      match_percentage: number;
      matched: string[];
      missing: string[];
    };
    soft_skills: {
      match_percentage: number;
      matched: string[];
      missing: string[];
    };
  };
  experience_match: {
    required_years: string;
    candidate_years: string;
    assessment: string;
  };
  education_match: {
    required: string;
    candidate_has: string;
    assessment: string;
  };
  missing_keywords: Array<{
    keyword: string;
    importance: string;
    suggestion: string;
  }>;
  matching_keywords: Array<{
    keyword: string;
    found_in_resume: boolean;
  }>;
  strengths: Array<{
    area: string;
    details: string;
  }>;
  weaknesses: Array<{
    area: string;
    details: string;
    how_to_improve: string;
  }>;
  resume_improvements: Array<{
    section: string;
    priority: string;
    current: string;
    suggested: string;
  }>;
  ats_optimization_tips: string[];
  cover_letter_points: string[];
  error?: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API Functions

// Health Check
export async function checkHealth(): Promise<{ status: string; groq_api: string }> {
  return apiCall('/health');
}

// Resume Upload
export async function uploadResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload-resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Failed to upload resume');
  }

  return response.json();
}

// Resume Analysis
export async function analyzeResume(
  resumeText: string,
  targetRole?: string
): Promise<ResumeAnalysisResponse> {
  return apiCall('/analyze-resume', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Job Search - Manual
export async function searchJobs(
  searchTerm: string,
  location: string = 'United States',
  resultsWanted: number = 20,
  jobType?: string
): Promise<JobSearchResponse> {
  return apiCall('/search-jobs', {
    method: 'POST',
    body: JSON.stringify({
      search_term: searchTerm,
      location,
      results_wanted: resultsWanted,
      job_type: jobType || null,
    }),
  });
}

// Job Search - By Resume
export async function searchJobsByResume(
  resumeText: string,
  location: string = 'United States',
  resultsWanted: number = 20,
  jobType?: string
): Promise<JobSearchResponse> {
  return apiCall('/search-jobs-by-resume', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      location,
      results_wanted: resultsWanted,
      job_type: jobType || null,
    }),
  });
}

// Career Insights - Paths
export async function getCareerPaths(
  resumeText: string,
  targetRole?: string
): Promise<CareerPathsResponse> {
  return apiCall('/career-insights/paths', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Career Insights - Skill Gaps
export async function getSkillGaps(
  resumeText: string,
  targetRole?: string
): Promise<SkillGapsResponse> {
  return apiCall('/career-insights/skill-gaps', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Career Insights - Salary
export async function getSalaryInsights(
  resumeText: string,
  targetRole?: string,
  location: string = 'United States'
): Promise<SalaryInsightsResponse> {
  return apiCall('/career-insights/salary', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
      location,
    }),
  });
}

// Career Insights - Interview Prep
export async function getInterviewPrep(
  resumeText: string,
  targetRole?: string
): Promise<InterviewPrepResponse> {
  return apiCall('/career-insights/interview-prep', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Career Insights - Learning
export async function getLearningRecommendations(
  resumeText: string,
  targetRole?: string
): Promise<LearningResponse> {
  return apiCall('/career-insights/learning', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Career Insights - Industry
export async function getIndustryInsights(
  resumeText: string,
  targetRole?: string
): Promise<IndustryInsightsResponse> {
  return apiCall('/career-insights/industry', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Job Match
export async function matchResumeToJob(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResponse> {
  return apiCall('/job-match', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      job_description: jobDescription,
    }),
  });
}

// ==========================================
// NEW FEATURES
// ==========================================

// Cover Letter Generator
export interface CoverLetterRequest {
  resume_text: string;
  job_title: string;
  company_name: string;
  job_description?: string;
  tone?: string;
  additional_info?: string;
}

export interface CoverLetterResponse {
  cover_letter: string;
}

export async function generateCoverLetter(
  request: CoverLetterRequest
): Promise<CoverLetterResponse> {
  return apiCall('/generate-cover-letter', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Interview Questions
export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  tips: string[];
}

export interface InterviewQuestionsResponse {
  questions: InterviewQuestion[];
}

export async function getInterviewQuestions(
  resumeText: string,
  targetRole?: string
): Promise<InterviewQuestionsResponse> {
  return apiCall('/interview-questions', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      target_role: targetRole || null,
    }),
  });
}

// Evaluate Interview Answer
export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  targetRole?: string
): Promise<AnswerEvaluation> {
  return apiCall('/evaluate-answer', {
    method: 'POST',
    body: JSON.stringify({
      question,
      answer,
      target_role: targetRole || null,
    }),
  });
}

// Resume Section Enhancement
export interface EnhanceSectionResponse {
  enhanced_content: string;
}

export async function enhanceResumeSection(
  sectionType: string,
  content: string,
  targetRole?: string
): Promise<EnhanceSectionResponse> {
  return apiCall('/enhance-resume-section', {
    method: 'POST',
    body: JSON.stringify({
      section_type: sectionType,
      content,
      target_role: targetRole || null,
    }),
  });
}

