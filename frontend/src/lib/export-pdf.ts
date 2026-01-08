// PDF Export utilities for Agragrati
// Uses html2canvas and jsPDF for client-side PDF generation

interface ExportOptions {
  filename?: string;
  title?: string;
  includeDate?: boolean;
  pageSize?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}

// Format analysis data for PDF
const formatAnalysisForPDF = (analysis: any): string => {
  if (!analysis) return "No analysis data available.";
  
  let content = "";
  
  if (analysis.overall_score !== undefined) {
    content += `\nOVERALL SCORE: ${analysis.overall_score}/100\n`;
    content += "=".repeat(40) + "\n\n";
  }
  
  if (analysis.summary) {
    content += "SUMMARY\n";
    content += "-".repeat(20) + "\n";
    content += analysis.summary + "\n\n";
  }
  
  if (analysis.strengths?.length) {
    content += "STRENGTHS\n";
    content += "-".repeat(20) + "\n";
    analysis.strengths.forEach((s: string, i: number) => {
      content += `${i + 1}. ${s}\n`;
    });
    content += "\n";
  }
  
  if (analysis.weaknesses?.length) {
    content += "AREAS FOR IMPROVEMENT\n";
    content += "-".repeat(20) + "\n";
    analysis.weaknesses.forEach((w: string, i: number) => {
      content += `${i + 1}. ${w}\n`;
    });
    content += "\n";
  }
  
  if (analysis.recommendations?.length) {
    content += "RECOMMENDATIONS\n";
    content += "-".repeat(20) + "\n";
    analysis.recommendations.forEach((r: string, i: number) => {
      content += `${i + 1}. ${r}\n`;
    });
    content += "\n";
  }
  
  if (analysis.skills?.length) {
    content += "SKILLS IDENTIFIED\n";
    content += "-".repeat(20) + "\n";
    content += analysis.skills.join(", ") + "\n\n";
  }
  
  if (analysis.experience_years !== undefined) {
    content += `EXPERIENCE: ${analysis.experience_years} years\n`;
  }
  
  if (analysis.education?.length) {
    content += "\nEDUCATION\n";
    content += "-".repeat(20) + "\n";
    analysis.education.forEach((edu: any) => {
      content += `• ${edu.degree || edu}\n`;
      if (edu.institution) content += `  ${edu.institution}\n`;
    });
  }
  
  return content;
};

// Format job match for PDF
const formatJobMatchForPDF = (match: any): string => {
  if (!match) return "No job match data available.";
  
  let content = "";
  
  content += `MATCH SCORE: ${match.match_score}%\n`;
  content += "=".repeat(40) + "\n\n";
  
  if (match.summary) {
    content += "MATCH SUMMARY\n";
    content += "-".repeat(20) + "\n";
    content += match.summary + "\n\n";
  }
  
  if (match.matching_skills?.length) {
    content += "MATCHING SKILLS\n";
    content += "-".repeat(20) + "\n";
    match.matching_skills.forEach((s: string) => {
      content += `✓ ${s}\n`;
    });
    content += "\n";
  }
  
  if (match.missing_skills?.length) {
    content += "SKILLS TO DEVELOP\n";
    content += "-".repeat(20) + "\n";
    match.missing_skills.forEach((s: string) => {
      content += `• ${s}\n`;
    });
    content += "\n";
  }
  
  if (match.recommendations?.length) {
    content += "RECOMMENDATIONS\n";
    content += "-".repeat(20) + "\n";
    match.recommendations.forEach((r: string, i: number) => {
      content += `${i + 1}. ${r}\n`;
    });
  }
  
  return content;
};

// Format career insights for PDF
const formatCareerInsightsForPDF = (insights: any): string => {
  let content = "";
  
  if (insights.careerPaths) {
    content += "CAREER PATHS\n";
    content += "=".repeat(40) + "\n";
    insights.careerPaths.paths?.forEach((path: any, i: number) => {
      content += `\n${i + 1}. ${path.title || path.role}\n`;
      if (path.description) content += `   ${path.description}\n`;
      if (path.timeline) content += `   Timeline: ${path.timeline}\n`;
    });
    content += "\n";
  }
  
  if (insights.skillGaps) {
    content += "\nSKILL GAPS ANALYSIS\n";
    content += "=".repeat(40) + "\n";
    insights.skillGaps.gaps?.forEach((gap: any) => {
      content += `\n• ${gap.skill}: ${gap.priority || gap.importance}\n`;
      if (gap.recommendation) content += `  → ${gap.recommendation}\n`;
    });
    content += "\n";
  }
  
  if (insights.salaryInsights) {
    content += "\nSALARY INSIGHTS\n";
    content += "=".repeat(40) + "\n";
    const salary = insights.salaryInsights;
    if (salary.range) content += `Range: ${salary.range}\n`;
    if (salary.median) content += `Median: ${salary.median}\n`;
    if (salary.factors) {
      content += "Key Factors:\n";
      salary.factors.forEach((f: string) => content += `• ${f}\n`);
    }
    content += "\n";
  }
  
  return content;
};

// Format cover letter for PDF
const formatCoverLetterForPDF = (letter: string, jobTitle?: string, company?: string): string => {
  let content = "";
  
  if (jobTitle || company) {
    content += "COVER LETTER\n";
    if (jobTitle) content += `Position: ${jobTitle}\n`;
    if (company) content += `Company: ${company}\n`;
    content += "=".repeat(40) + "\n\n";
  }
  
  content += letter;
  
  return content;
};

// Main export function - creates a downloadable text file
// For full PDF support, you'll need to install jspdf and html2canvas
export const exportToFile = (
  content: string,
  options: ExportOptions = {}
) => {
  const {
    filename = "agragrati-export",
    title = "Agragrati Report",
    includeDate = true,
  } = options;
  
  let fullContent = title + "\n";
  fullContent += "=".repeat(title.length) + "\n";
  
  if (includeDate) {
    fullContent += `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
  }
  
  fullContent += "\n" + content;
  
  // Create blob and download
  const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export analysis results
export const exportAnalysis = (analysis: any, options?: ExportOptions) => {
  const content = formatAnalysisForPDF(analysis);
  exportToFile(content, {
    filename: "resume-analysis",
    title: "Resume Analysis Report",
    ...options,
  });
};

// Export job match results
export const exportJobMatch = (match: any, options?: ExportOptions) => {
  const content = formatJobMatchForPDF(match);
  exportToFile(content, {
    filename: "job-match-analysis",
    title: "Job Match Analysis Report",
    ...options,
  });
};

// Export career insights
export const exportCareerInsights = (insights: any, options?: ExportOptions) => {
  const content = formatCareerInsightsForPDF(insights);
  exportToFile(content, {
    filename: "career-insights",
    title: "Career Insights Report",
    ...options,
  });
};

// Export cover letter
export const exportCoverLetter = (
  letter: string, 
  jobTitle?: string, 
  company?: string,
  options?: ExportOptions
) => {
  const content = formatCoverLetterForPDF(letter, jobTitle, company);
  exportToFile(content, {
    filename: `cover-letter${company ? `-${company.toLowerCase().replace(/\s+/g, "-")}` : ""}`,
    title: "Cover Letter",
    ...options,
  });
};

// Export resume (from ResumeBuilder)
export const exportResume = (resumeData: any, options?: ExportOptions) => {
  let content = "";
  
  // Personal Info
  if (resumeData.personalInfo) {
    const info = resumeData.personalInfo;
    content += `${info.fullName || ""}\n`;
    content += `${info.email || ""} | ${info.phone || ""}\n`;
    if (info.location) content += `${info.location}\n`;
    if (info.linkedin) content += `LinkedIn: ${info.linkedin}\n`;
    if (info.website) content += `Website: ${info.website}\n`;
    content += "\n";
  }
  
  // Sections
  resumeData.sections?.forEach((section: any) => {
    content += `${section.title.toUpperCase()}\n`;
    content += "-".repeat(section.title.length) + "\n";
    content += section.content + "\n\n";
  });
  
  exportToFile(content, {
    filename: "resume",
    title: "Resume",
    includeDate: false,
    ...options,
  });
};

// Export applications tracker
export const exportApplications = (applications: any[], options?: ExportOptions) => {
  let content = "";
  
  applications.forEach((app, i) => {
    content += `${i + 1}. ${app.job_title} at ${app.company}\n`;
    content += `   Status: ${app.status}\n`;
    if (app.applied_date) content += `   Applied: ${new Date(app.applied_date).toLocaleDateString()}\n`;
    if (app.notes) content += `   Notes: ${app.notes}\n`;
    content += "\n";
  });
  
  exportToFile(content, {
    filename: "job-applications",
    title: "Job Applications Tracker",
    ...options,
  });
};
