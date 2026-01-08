import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ResumeState {
  // Resume data
  resumeText: string | null;
  resumeFilename: string | null;
  targetRole: string | null;
  isAnalyzed: boolean;
  analysisResult: string | null;

  // Career insights cache
  careerPaths: unknown | null;
  skillGaps: unknown | null;
  salaryInsights: unknown | null;
  interviewPrep: unknown | null;
  learningResources: unknown | null;
  industryInsights: unknown | null;
  jobMatchResult: unknown | null;

  // Actions
  setResume: (text: string, filename: string) => void;
  setTargetRole: (role: string | null) => void;
  setAnalysisResult: (result: string) => void;
  setCareerPaths: (data: unknown) => void;
  setSkillGaps: (data: unknown) => void;
  setSalaryInsights: (data: unknown) => void;
  setInterviewPrep: (data: unknown) => void;
  setLearningResources: (data: unknown) => void;
  setIndustryInsights: (data: unknown) => void;
  setJobMatchResult: (data: unknown) => void;
  clearInsights: () => void;
  clearAll: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      // Initial state
      resumeText: null,
      resumeFilename: null,
      targetRole: null,
      isAnalyzed: false,
      analysisResult: null,
      careerPaths: null,
      skillGaps: null,
      salaryInsights: null,
      interviewPrep: null,
      learningResources: null,
      industryInsights: null,
      jobMatchResult: null,

      // Actions
      setResume: (text, filename) =>
        set({
          resumeText: text,
          resumeFilename: filename,
          isAnalyzed: false,
          analysisResult: null,
          // Clear cached insights when new resume is uploaded
          careerPaths: null,
          skillGaps: null,
          salaryInsights: null,
          interviewPrep: null,
          learningResources: null,
          industryInsights: null,
          jobMatchResult: null,
        }),

      setTargetRole: (role) => set({ targetRole: role }),

      setAnalysisResult: (result) =>
        set({
          analysisResult: result,
          isAnalyzed: true,
        }),

      setCareerPaths: (data) => set({ careerPaths: data }),
      setSkillGaps: (data) => set({ skillGaps: data }),
      setSalaryInsights: (data) => set({ salaryInsights: data }),
      setInterviewPrep: (data) => set({ interviewPrep: data }),
      setLearningResources: (data) => set({ learningResources: data }),
      setIndustryInsights: (data) => set({ industryInsights: data }),
      setJobMatchResult: (data) => set({ jobMatchResult: data }),

      clearInsights: () =>
        set({
          careerPaths: null,
          skillGaps: null,
          salaryInsights: null,
          interviewPrep: null,
          learningResources: null,
          industryInsights: null,
          jobMatchResult: null,
        }),

      clearAll: () =>
        set({
          resumeText: null,
          resumeFilename: null,
          targetRole: null,
          isAnalyzed: false,
          analysisResult: null,
          careerPaths: null,
          skillGaps: null,
          salaryInsights: null,
          interviewPrep: null,
          learningResources: null,
          industryInsights: null,
          jobMatchResult: null,
        }),
    }),
    {
      name: 'agragrati-resume-storage',
      partialize: (state) => ({
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
        targetRole: state.targetRole,
        isAnalyzed: state.isAnalyzed,
        analysisResult: state.analysisResult,
      }),
    }
  )
);
