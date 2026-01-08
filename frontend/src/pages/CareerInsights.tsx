import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Lightbulb, TrendingUp, Target, DollarSign, Mic, BookOpen, Building2,
  ChevronRight, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import {
  getCareerPaths,
  getSkillGaps,
  getSalaryInsights,
  getInterviewPrep,
  getLearningRecommendations,
  getIndustryInsights,
  type CareerPathsResponse,
  type SkillGapsResponse,
  type SalaryInsightsResponse,
  type InterviewPrepResponse,
  type LearningResponse,
  type IndustryInsightsResponse,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

const CareerInsights = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    resumeText, 
    targetRole, 
    isAnalyzed,
    careerPaths,
    skillGaps,
    salaryInsights,
    interviewPrep,
    learningResources,
    industryInsights,
    setCareerPaths,
    setSkillGaps,
    setSalaryInsights,
    setInterviewPrep,
    setLearningResources,
    setIndustryInsights,
  } = useResumeStore();

  const [loading, setLoading] = useState<string | null>(null);
  const [salaryLocation, setSalaryLocation] = useState("United States");

  // Type assertions for cached data
  const careerData = careerPaths as CareerPathsResponse | null;
  const skillData = skillGaps as SkillGapsResponse | null;
  const salaryData = salaryInsights as SalaryInsightsResponse | null;
  const interviewData = interviewPrep as InterviewPrepResponse | null;
  const learningData = learningResources as LearningResponse | null;
  const industryData = industryInsights as IndustryInsightsResponse | null;

  const fetchCareerPaths = async () => {
    if (!resumeText) return;
    setLoading("career");
    try {
      const data = await getCareerPaths(resumeText, targetRole || undefined);
      setCareerPaths(data);
      toast({ title: "Career paths loaded" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fetchSkillGaps = async () => {
    if (!resumeText) return;
    setLoading("skills");
    try {
      const data = await getSkillGaps(resumeText, targetRole || undefined);
      setSkillGaps(data);
      toast({ title: "Skill analysis loaded" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fetchSalaryInsights = async () => {
    if (!resumeText) return;
    setLoading("salary");
    try {
      const data = await getSalaryInsights(resumeText, targetRole || undefined, salaryLocation);
      setSalaryInsights(data);
      toast({ title: "Salary insights loaded" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fetchInterviewPrep = async () => {
    if (!resumeText) return;
    setLoading("interview");
    try {
      const data = await getInterviewPrep(resumeText, targetRole || undefined);
      setInterviewPrep(data);
      toast({ title: "Interview prep loaded" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fetchLearning = async () => {
    if (!resumeText) return;
    setLoading("learning");
    try {
      const data = await getLearningRecommendations(resumeText, targetRole || undefined);
      setLearningResources(data);
      toast({ title: "Learning recommendations loaded" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fetchIndustry = async () => {
    if (!resumeText) return;
    setLoading("industry");
    try {
      const data = await getIndustryInsights(resumeText, targetRole || undefined);
      setIndustryInsights(data);
      toast({ title: "Industry insights loaded" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  if (!isAnalyzed || !resumeText) {
    return (
      <Layout>
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-2xl mx-auto shadow-xl border-2">
              <CardContent className="pt-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Resume Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please upload and analyze your resume first to unlock personalized career insights.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => navigate("/resume-analysis")} size="lg">
                    Go to Resume Analysis
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </Layout>
    );
  }

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
              Personalized Guidance
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Career Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered analysis to guide your career growth and development
            </p>
            {targetRole && (
              <Badge variant="outline" className="mt-4">
                Target Role: {targetRole}
              </Badge>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="career" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8 h-auto p-1 bg-card shadow-lg">
              <TabsTrigger value="career" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Career Paths</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Target className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Skill Gaps</span>
              </TabsTrigger>
              <TabsTrigger value="salary" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Salary</span>
              </TabsTrigger>
              <TabsTrigger value="interview" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mic className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Interview</span>
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger value="industry" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Industry</span>
              </TabsTrigger>
            </TabsList>

            {/* Career Paths Tab */}
            <TabsContent value="career">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Career Path Analysis
                  </CardTitle>
                  <CardDescription>
                    Discover potential career trajectories based on your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!careerData && (
                    <Button onClick={fetchCareerPaths} disabled={loading === "career"} className="mb-6">
                      {loading === "career" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                      Analyze Career Paths
                    </Button>
                  )}
                  
                  {careerData && !careerData.error && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-lg font-semibold">Current Level: <span className="text-primary">{careerData.current_level}</span></p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="bg-success/5 border-success/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-success" />
                              Strengths for Growth
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {careerData.strengths_for_growth?.map((s, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-success mt-0.5" />
                                  <span className="text-sm">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-accent/5 border-accent/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="w-5 h-5 text-accent" />
                              Areas to Develop
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {careerData.growth_areas?.map((a, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-accent mt-0.5" />
                                  <span className="text-sm">{a}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Potential Career Paths</h3>
                        <Accordion type="single" collapsible className="space-y-2">
                          {careerData.career_paths?.map((path, i) => (
                            <AccordionItem key={i} value={`path-${i}`} className="border rounded-lg px-4">
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{i + 1}</Badge>
                                  <span className="font-semibold">{path.path_name}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3 pb-4">
                                <p className="text-muted-foreground">{path.description}</p>
                                <div className="grid gap-2">
                                  <p><strong>Next Role:</strong> {path.next_role}</p>
                                  <p><strong>Timeline:</strong> {path.timeline}</p>
                                </div>
                                <div>
                                  <strong>Key Requirements:</strong>
                                  <ul className="mt-2 space-y-1">
                                    {path.requirements?.map((req, j) => (
                                      <li key={j} className="text-sm text-muted-foreground">• {req}</li>
                                    ))}
                                  </ul>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skill Gaps Tab */}
            <TabsContent value="skills">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Target className="w-6 h-6 text-primary" />
                    Skill Gap Analysis
                  </CardTitle>
                  <CardDescription>
                    Identify skills to develop for your target role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!skillData && (
                    <Button onClick={fetchSkillGaps} disabled={loading === "skills"} className="mb-6">
                      {loading === "skills" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                      Analyze Skills
                    </Button>
                  )}
                  
                  {skillData && !skillData.error && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Skills Match</span>
                          <span className="text-2xl font-bold text-primary">{skillData.match_percentage}%</span>
                        </div>
                        <Progress value={skillData.match_percentage} className="h-3" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Your Current Skills</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm text-muted-foreground">Technical</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {skillData.current_skills?.technical?.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="bg-success/20">{s}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Soft Skills</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {skillData.current_skills?.soft?.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="bg-primary/20">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Required Skills</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm text-muted-foreground">Technical</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {skillData.required_skills?.technical?.map((s, i) => (
                                  <Badge key={i} variant="outline">{s}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Soft Skills</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {skillData.required_skills?.soft?.map((s, i) => (
                                  <Badge key={i} variant="outline">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Priority Skill Gaps</h3>
                        <div className="space-y-3">
                          {skillData.skill_gaps?.map((gap, i) => {
                            const priorityColor = gap.priority === "High" ? "destructive" : gap.priority === "Medium" ? "default" : "secondary";
                            return (
                              <Card key={i}>
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="font-semibold">{gap.skill}</span>
                                    <Badge variant={priorityColor}>{gap.priority}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{gap.importance}</p>
                                  <p className="text-sm"><strong>How to acquire:</strong> {gap.how_to_acquire}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Salary Tab */}
            <TabsContent value="salary">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <DollarSign className="w-6 h-6 text-primary" />
                    Salary Insights
                  </CardTitle>
                  <CardDescription>
                    Understand your market value and compensation expectations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <Label>Location</Label>
                      <Input 
                        value={salaryLocation} 
                        onChange={(e) => setSalaryLocation(e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    <Button onClick={fetchSalaryInsights} disabled={loading === "salary"} className="mt-6">
                      {loading === "salary" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                      Get Insights
                    </Button>
                  </div>
                  
                  {salaryData && !salaryData.error && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Your Estimated Market Value</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Low</p>
                            <p className="text-2xl font-bold">${salaryData.estimated_current_value?.low?.toLocaleString()}</p>
                          </div>
                          <div className="border-x border-border px-4">
                            <p className="text-sm text-muted-foreground">Mid</p>
                            <p className="text-3xl font-bold text-primary">${salaryData.estimated_current_value?.mid?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">High</p>
                            <p className="text-2xl font-bold">${salaryData.estimated_current_value?.high?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Market Rate by Level</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {["entry_level", "mid_level", "senior_level", "lead_level"].map((level) => {
                            const data = salaryData.market_rate?.[level as keyof typeof salaryData.market_rate];
                            const label = level.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
                            return (
                              <Card key={level}>
                                <CardContent className="pt-4 text-center">
                                  <p className="text-sm text-muted-foreground">{label}</p>
                                  <p className="font-semibold">${data?.low?.toLocaleString()} - ${data?.high?.toLocaleString()}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Factors Affecting Salary</h3>
                        <div className="space-y-2">
                          {salaryData.factors_affecting_salary?.map((factor, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                              <span className={factor.impact === "Positive" ? "text-success" : "text-destructive"}>
                                {factor.impact === "Positive" ? "📈" : "📉"}
                              </span>
                              <div>
                                <span className="font-medium">{factor.factor}:</span>
                                <span className="text-muted-foreground ml-2">{factor.details}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Negotiation Tips</h3>
                        <ul className="space-y-2">
                          {salaryData.negotiation_tips?.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interview Tab */}
            <TabsContent value="interview">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Mic className="w-6 h-6 text-primary" />
                    Interview Preparation
                  </CardTitle>
                  <CardDescription>
                    Prepare for interviews with personalized guidance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!interviewData && (
                    <Button onClick={fetchInterviewPrep} disabled={loading === "interview"} className="mb-6">
                      {loading === "interview" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mic className="w-4 h-4 mr-2" />}
                      Generate Interview Prep
                    </Button>
                  )}
                  
                  {interviewData && !interviewData.error && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Likely Interview Questions</h3>
                        <Accordion type="single" collapsible className="space-y-2">
                          {interviewData.likely_questions?.map((q, i) => (
                            <AccordionItem key={i} value={`q-${i}`} className="border rounded-lg px-4">
                              <AccordionTrigger className="hover:no-underline text-left">
                                <span className="font-medium">{q.question}</span>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2 pb-4">
                                <Badge variant="outline">{q.category}</Badge>
                                <p className="text-muted-foreground">{q.suggested_approach}</p>
                                <div>
                                  <strong>Resume points to highlight:</strong>
                                  <ul className="mt-1">
                                    {q.resume_points_to_highlight?.map((p, j) => (
                                      <li key={j} className="text-sm text-muted-foreground">• {p}</li>
                                    ))}
                                  </ul>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Technical Topics to Review</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {interviewData.technical_topics_to_review?.map((t, i) => (
                                <li key={i} className="text-sm">• {t}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Questions to Ask Interviewer</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {interviewData.questions_to_ask_interviewer?.map((q, i) => (
                                <li key={i} className="text-sm">• {q}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value="learning">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Learning & Development
                  </CardTitle>
                  <CardDescription>
                    Courses, certifications, and resources to grow your skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!learningData && (
                    <Button onClick={fetchLearning} disabled={loading === "learning"} className="mb-6">
                      {loading === "learning" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                      Get Recommendations
                    </Button>
                  )}
                  
                  {learningData && !learningData.error && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Recommended Courses</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {learningData.courses?.map((course, i) => (
                            <Card key={i}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="font-semibold">{course.title}</span>
                                  <Badge variant={course.priority === "High" ? "destructive" : "secondary"}>{course.priority}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{course.platform}</p>
                                <p className="text-sm">Skill: {course.skill_covered}</p>
                                <p className="text-sm text-muted-foreground">{course.estimated_duration}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Valuable Certifications</h3>
                        <div className="space-y-3">
                          {learningData.certifications?.map((cert, i) => (
                            <Card key={i}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <span className="font-semibold">{cert.name}</span>
                                    <p className="text-sm text-muted-foreground">{cert.provider}</p>
                                  </div>
                                  <Badge variant="outline">{cert.difficulty}</Badge>
                                </div>
                                <p className="text-sm mt-2">{cert.value}</p>
                                <p className="text-sm text-muted-foreground">Prep time: {cert.estimated_prep_time}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Communities to Join</h3>
                        <div className="flex flex-wrap gap-2">
                          {learningData.communities_to_join?.map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-sm">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Industry Tab */}
            <TabsContent value="industry">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Building2 className="w-6 h-6 text-primary" />
                    Industry Insights
                  </CardTitle>
                  <CardDescription>
                    Market trends and opportunities in your field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!industryData && (
                    <Button onClick={fetchIndustry} disabled={loading === "industry"} className="mb-6">
                      {loading === "industry" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />}
                      Analyze Industry
                    </Button>
                  )}
                  
                  {industryData && !industryData.error && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Relevant Industries</h3>
                        <div className="flex flex-wrap gap-2">
                          {industryData.relevant_industries?.map((ind, i) => (
                            <Badge key={i} variant="secondary">{ind}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="text-center">
                          <CardContent className="pt-4">
                            <p className="text-sm text-muted-foreground">Job Demand</p>
                            <p className="text-2xl font-bold">
                              {industryData.market_outlook?.demand === "High" ? "🟢" : industryData.market_outlook?.demand === "Medium" ? "🟡" : "🔴"} {industryData.market_outlook?.demand}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="text-center">
                          <CardContent className="pt-4">
                            <p className="text-sm text-muted-foreground">Competition</p>
                            <p className="text-2xl font-bold">
                              {industryData.market_outlook?.competition === "Low" ? "🟢" : industryData.market_outlook?.competition === "Medium" ? "🟡" : "🔴"} {industryData.market_outlook?.competition}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4">
                            <p className="text-sm text-muted-foreground">Summary</p>
                            <p className="text-sm">{industryData.market_outlook?.summary}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Key Industry Trends</h3>
                        <Accordion type="single" collapsible className="space-y-2">
                          {industryData.industry_trends?.map((trend, i) => (
                            <AccordionItem key={i} value={`trend-${i}`} className="border rounded-lg px-4">
                              <AccordionTrigger className="hover:no-underline">
                                📌 {trend.trend}
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2 pb-4">
                                <p><strong>Impact:</strong> {trend.impact}</p>
                                <p><strong>Opportunity:</strong> {trend.opportunity}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Emerging Roles</h3>
                        <div className="space-y-2">
                          {industryData.emerging_roles?.map((role, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                              <span>{role.fit_score === "High" ? "🟢" : role.fit_score === "Medium" ? "🟡" : "🔴"}</span>
                              <div>
                                <span className="font-medium">{role.role}</span>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>
    </Layout>
  );
};

export default CareerInsights;
