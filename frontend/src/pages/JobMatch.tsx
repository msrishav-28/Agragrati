import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Target, FileText, ClipboardList, CheckCircle, AlertCircle, 
  Lightbulb, Loader2, Key, TrendingUp, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { matchResumeToJob, type JobMatchResponse } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

const JobMatch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumeText, resumeFilename, jobMatchResult, setJobMatchResult } = useResumeStore();

  const [useUploadedResume, setUseUploadedResume] = useState(true);
  const [pastedResume, setPastedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const matchData = jobMatchResult as JobMatchResponse | null;

  const handleAnalyze = async () => {
    const resumeToUse = useUploadedResume ? resumeText : pastedResume;

    if (!resumeToUse || !resumeToUse.trim()) {
      toast({
        title: "Resume required",
        description: "Please provide your resume text",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste the job description",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const result = await matchResumeToJob(resumeToUse, jobDescription);
      setJobMatchResult(result);
      toast({
        title: "Analysis complete",
        description: `Match score: ${result.match_score}%`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-destructive";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "👍";
    if (score >= 40) return "⚠️";
    return "📉";
  };

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
              Resume vs Job Description
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Job Match Score
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how well your resume matches specific job listings and get tailored improvement suggestions
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
          <motion.div variants={fadeInUp}>
            <Card className="shadow-xl border-2 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-primary" />
                  Compare Resume to Job
                </CardTitle>
                <CardDescription>
                  Paste a job description to see how well your resume matches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Resume Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Your Resume
                      </Label>
                    </div>

                  <Tabs value={useUploadedResume ? "uploaded" : "paste"} onValueChange={(v) => setUseUploadedResume(v === "uploaded")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="uploaded" disabled={!resumeText}>
                        Use Uploaded
                      </TabsTrigger>
                      <TabsTrigger value="paste">
                        Paste Text
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="uploaded" className="mt-4">
                      {resumeText ? (
                        <div className="space-y-2">
                          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                            <p className="text-success flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Using: {resumeFilename || "Uploaded resume"}
                            </p>
                          </div>
                          <Textarea
                            value={resumeText.substring(0, 500) + (resumeText.length > 500 ? "..." : "")}
                            readOnly
                            className="h-48 text-sm text-muted-foreground"
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            No resume uploaded. Please upload one first or paste text.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => navigate("/resume-analysis")}
                          >
                            Go to Resume Analysis
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="paste" className="mt-4">
                      <Textarea
                        placeholder="Paste your complete resume text here..."
                        value={pastedResume}
                        onChange={(e) => setPastedResume(e.target.value)}
                        className="h-64"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Job Description Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Job Description
                  </Label>
                  <Textarea
                    placeholder="Paste the complete job description from the job posting here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="h-72"
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Calculate Match Score
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          {/* Results */}
          {matchData && !matchData.error && (
            <motion.div 
              className="space-y-6"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {/* Big Score Card */}
              <motion.div variants={scaleIn}>
                <Card className="shadow-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 text-center text-white">
                    <motion.div 
                      className="text-6xl mb-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      {getScoreEmoji(matchData.match_score)}
                    </motion.div>
                    <motion.div 
                      className={`text-7xl font-bold ${getScoreColor(matchData.match_score)}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {matchData.match_score}%
                    </motion.div>
                    <div className="text-2xl font-semibold mt-2">{matchData.match_level}</div>
                    <p className="mt-4 text-white/90 max-w-2xl mx-auto">{matchData.summary}</p>
                  </div>
                </Card>
              </motion.div>

              {/* Skills Breakdown */}
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Skills Match Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Technical Skills */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                          <span className="font-semibold">Technical Skills</span>
                          <span className="font-bold text-primary">
                            {matchData.skills_breakdown?.technical_skills?.match_percentage}%
                          </span>
                        </div>
                        <Progress value={matchData.skills_breakdown?.technical_skills?.match_percentage} className="h-3" />
                      </div>
                      
                      <div>
                        <Label className="text-sm text-success">✅ Matched</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {matchData.skills_breakdown?.technical_skills?.matched?.map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-success/20">{s}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-destructive">❌ Missing</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {matchData.skills_breakdown?.technical_skills?.missing?.map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-destructive/20">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Soft Skills */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Soft Skills</span>
                          <span className="font-bold text-primary">
                            {matchData.skills_breakdown?.soft_skills?.match_percentage}%
                          </span>
                        </div>
                        <Progress value={matchData.skills_breakdown?.soft_skills?.match_percentage} className="h-3" />
                      </div>
                      
                      <div>
                        <Label className="text-sm text-success">✅ Matched</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {matchData.skills_breakdown?.soft_skills?.matched?.map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-success/20">{s}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-destructive">❌ Missing</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {matchData.skills_breakdown?.soft_skills?.missing?.map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-destructive/20">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Experience & Education */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">💼 Experience Match</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Required:</strong> {matchData.experience_match?.required_years}</p>
                    <p><strong>Your Experience:</strong> {matchData.experience_match?.candidate_years}</p>
                    <Badge variant={matchData.experience_match?.assessment === "Meets" || matchData.experience_match?.assessment === "Exceeds" ? "default" : "destructive"}>
                      {matchData.experience_match?.assessment === "Meets" || matchData.experience_match?.assessment === "Exceeds" ? "✅" : "⚠️"} {matchData.experience_match?.assessment}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">🎓 Education Match</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Required:</strong> {matchData.education_match?.required}</p>
                    <p><strong>Your Education:</strong> {matchData.education_match?.candidate_has}</p>
                    <Badge variant={matchData.education_match?.assessment === "Meets" || matchData.education_match?.assessment === "Exceeds" ? "default" : "destructive"}>
                      {matchData.education_match?.assessment === "Meets" || matchData.education_match?.assessment === "Exceeds" ? "✅" : "⚠️"} {matchData.education_match?.assessment}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Missing Keywords */}
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Key className="w-5 h-5 text-primary" />
                    Missing Keywords to Add
                  </CardTitle>
                  <CardDescription>
                    Adding these keywords can significantly improve your ATS score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {matchData.missing_keywords?.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-2">
                      {matchData.missing_keywords.map((kw, i) => {
                        const importanceColor = kw.importance === "Critical" ? "destructive" : kw.importance === "Important" ? "default" : "secondary";
                        return (
                          <AccordionItem key={i} value={`kw-${i}`} className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2">
                                <Badge variant={importanceColor}>{kw.importance}</Badge>
                                <span className="font-medium">{kw.keyword}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground">{kw.suggestion}</p>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  ) : (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-success flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Great! Your resume contains all key keywords from the job description.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Matching Keywords */}
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Matching Keywords Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {matchData.matching_keywords?.filter(k => k.found_in_resume).map((kw, i) => (
                      <Badge key={i} variant="secondary" className="bg-success/20">
                        ✓ {kw.keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="w-5 h-5 text-success" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {matchData.strengths?.map((s, i) => (
                      <div key={i}>
                        <p className="font-semibold">✅ {s.area}</p>
                        <p className="text-sm text-muted-foreground">{s.details}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {matchData.weaknesses?.map((w, i) => (
                      <div key={i}>
                        <p className="font-semibold">⚠️ {w.area}</p>
                        <p className="text-sm text-muted-foreground">{w.details}</p>
                        <p className="text-sm text-primary mt-1">💡 {w.how_to_improve}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Resume Improvements */}
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Specific Resume Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {matchData.resume_improvements?.map((imp, i) => {
                      const priorityColor = imp.priority === "High" ? "destructive" : imp.priority === "Medium" ? "default" : "secondary";
                      return (
                        <AccordionItem key={i} value={`imp-${i}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Badge variant={priorityColor}>{imp.priority}</Badge>
                              <span className="font-medium">{imp.section}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2">
                            <p><strong>Current:</strong> {imp.current}</p>
                            <p><strong>Suggested:</strong> {imp.suggested}</p>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>

              {/* ATS Tips & Cover Letter Points */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">🤖 ATS Optimization Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {matchData.ats_optimization_tips?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">✉️ Cover Letter Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {matchData.cover_letter_points?.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>
    </Layout>
  );
};

export default JobMatch;
