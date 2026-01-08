import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Upload, Sparkles, TrendingUp, Award, Target, CheckCircle, AlertCircle, Lightbulb, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { uploadResume, analyzeResume } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

const ResumeAnalysis = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    resumeText,
    resumeFilename,
    targetRole,
    isAnalyzed,
    analysisResult,
    setResume,
    setTargetRole,
    setAnalysisResult,
  } = useResumeStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState(targetRole || "");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedText, setUploadedText] = useState(resumeText || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      toast({
        title: "File selected",
        description: `${file.name} ready for upload`,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a resume file first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadResume(selectedFile);
      setUploadedText(result.resume_text);
      setResume(result.resume_text, result.filename);
      toast({
        title: "Resume uploaded successfully",
        description: `${result.filename} has been processed`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = uploadedText || resumeText;
    
    if (!textToAnalyze) {
      toast({
        title: "No resume content",
        description: "Please upload a resume first",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setTargetRole(jobRole || null);
    
    try {
      const result = await analyzeResume(textToAnalyze, jobRole || undefined);
      setAnalysisResult(result.analysis);
      toast({
        title: "Analysis complete!",
        description: "Your resume has been analyzed successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Parse the analysis result into sections
  const parseAnalysis = useCallback((text: string | null) => {
    if (!text) return null;
    
    const sections: Record<string, string> = {};
    const sectionHeaders = [
      "OVERALL IMPRESSION",
      "STRENGTHS",
      "AREAS FOR IMPROVEMENT",
      "SPECIFIC RECOMMENDATIONS",
      "ACTION ITEMS",
      "FINAL SCORE"
    ];
    
    let currentSection = "";
    const lines = text.split("\n");
    
    for (const line of lines) {
      const headerMatch = sectionHeaders.find(h => 
        line.toUpperCase().includes(h)
      );
      
      if (headerMatch) {
        currentSection = headerMatch;
        sections[currentSection] = "";
      } else if (currentSection) {
        sections[currentSection] += line + "\n";
      }
    }
    
    return sections;
  }, []);

  const parsedAnalysis = parseAnalysis(analysisResult);

  // Extract score from analysis
  const extractScore = useCallback(() => {
    if (!analysisResult) return null;
    const scoreMatch = analysisResult.match(/(\d+)\s*\/\s*10|(\d+)\/10|score[:\s]+(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    }
    return null;
  }, [analysisResult]);

  const score = extractScore();

  return (
    <Layout>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <motion.div 
          className="container mx-auto px-4 py-12 relative"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div className="max-w-4xl mx-auto text-center" variants={fadeInUp}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              AI-Powered Analysis
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Resume Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your resume to receive comprehensive AI-powered feedback and actionable insights
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Upload Section */}
          <motion.div variants={fadeInUp}>
            <Card className="shadow-xl border-2 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="w-6 h-6 text-primary" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription>
                  Upload a PDF or TXT file to get started with AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-base">Resume File</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="cursor-pointer flex-1"
                    />
                    <Button 
                      onClick={handleUpload} 
                      disabled={!selectedFile || uploading}
                      variant="outline"
                    >
                      {uploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Supports PDF and TXT formats</p>
                
                {(resumeFilename || uploadedText) && (
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {resumeFilename || "Resume loaded"}
                  </Badge>
                )}
              </div>

              {/* Target Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-base">Target Job Role (Optional)</Label>
                <Input
                  id="role"
                  placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Providing a target role helps tailor the analysis to your goals
                </p>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || (!uploadedText && !resumeText)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>

              {/* Feature Cards */}
              {!isAnalyzed && (
                <div className="grid md:grid-cols-3 gap-4 mt-8 pt-6 border-t">
                  <Card className="bg-gradient-to-br from-card to-secondary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">ATS Score</p>
                          <p className="text-sm text-muted-foreground">Compatibility check</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-card to-secondary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Award className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="font-semibold">Expert Insights</p>
                          <p className="text-sm text-muted-foreground">Professional tips</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-card to-secondary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">Action Items</p>
                          <p className="text-sm text-muted-foreground">Prioritized tasks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>

          {/* Analysis Results */}
          {isAnalyzed && analysisResult && (
            <motion.div 
              className="space-y-6"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {/* Score Card */}
              {score && (
                <motion.div variants={scaleIn}>
                  <Card className="shadow-xl border-2 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">Resume Score</h3>
                          <p className="text-muted-foreground">Based on comprehensive AI analysis</p>
                        </div>
                        <motion.div 
                          className="text-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary">{score}/10</span>
                          </div>
                        </motion.div>
                      </div>
                      <Progress value={score * 10} className="h-3" />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Analysis Sections */}
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <ClipboardList className="w-6 h-6 text-primary" />
                    Detailed Analysis
                  </CardTitle>
                  {targetRole && (
                    <CardDescription>
                      Analyzed for: <Badge variant="outline">{targetRole}</Badge>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" defaultValue={["overall", "strengths", "improvements"]} className="space-y-2">
                    {parsedAnalysis?.["OVERALL IMPRESSION"] && (
                      <AccordionItem value="overall" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Overall Impression</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {parsedAnalysis["OVERALL IMPRESSION"]}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {parsedAnalysis?.["STRENGTHS"] && (
                      <AccordionItem value="strengths" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-success" />
                            <span className="font-semibold">Strengths</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {parsedAnalysis["STRENGTHS"]}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {parsedAnalysis?.["AREAS FOR IMPROVEMENT"] && (
                      <AccordionItem value="improvements" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <span className="font-semibold">Areas for Improvement</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {parsedAnalysis["AREAS FOR IMPROVEMENT"]}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {parsedAnalysis?.["SPECIFIC RECOMMENDATIONS"] && (
                      <AccordionItem value="recommendations" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-accent" />
                            <span className="font-semibold">Recommendations</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {parsedAnalysis["SPECIFIC RECOMMENDATIONS"]}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {parsedAnalysis?.["ACTION ITEMS"] && (
                      <AccordionItem value="actions" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Action Items</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {parsedAnalysis["ACTION ITEMS"]}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>

                  {/* Full Analysis Fallback */}
                  {!parsedAnalysis && (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-line text-muted-foreground">
                        {analysisResult}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              </motion.div>

              {/* Next Steps */}
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-2 bg-gradient-to-br from-success/5 to-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      What's Next?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your resume has been analyzed! Explore these features to continue improving your career journey:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => navigate("/job-search")} variant="outline">
                          🔍 Search Jobs
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => navigate("/career-insights")} variant="outline">
                          💡 Career Insights
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => navigate("/job-match")} variant="outline">
                          🎯 Job Match Score
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </section>
    </Layout>
  );
};

export default ResumeAnalysis;
