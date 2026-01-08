import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PenTool, FileText, Sparkles, Copy, Download, Loader2, 
  CheckCircle, RefreshCw, Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { generateCoverLetter } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "confident", label: "Confident" },
  { value: "creative", label: "Creative" },
  { value: "formal", label: "Formal" },
];

const CoverLetter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumeText, isAnalyzed } = useResumeStore();

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [useResume, setUseResume] = useState(true);
  const [pastedResume, setPastedResume] = useState("");

  const handleGenerate = async () => {
    const resumeToUse = useResume ? resumeText : pastedResume;

    if (!resumeToUse) {
      toast({
        title: "Resume required",
        description: "Please provide your resume text",
        variant: "destructive",
      });
      return;
    }

    if (!jobTitle.trim() || !companyName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide job title and company name",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateCoverLetter({
        resume_text: resumeToUse,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        tone,
        additional_info: additionalInfo,
      });
      setCoverLetter(result.cover_letter);
      toast({
        title: "Cover letter generated!",
        description: "Your personalized cover letter is ready",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate cover letter",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast({ title: "Copied to clipboard!" });
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover_letter_${companyName.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
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
              AI-Powered Writing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Cover Letter Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create personalized, compelling cover letters tailored to each job application
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div 
          className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Input Section */}
          <motion.div variants={fadeInUp}>
            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <PenTool className="w-6 h-6 text-primary" />
                  Job Details
                </CardTitle>
                <CardDescription>
                  Provide information about the position you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Source */}
                <Tabs value={useResume ? "uploaded" : "paste"} onValueChange={(v) => setUseResume(v === "uploaded")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="uploaded" disabled={!isAnalyzed}>
                      <FileText className="w-4 h-4 mr-2" />
                      Use Uploaded Resume
                    </TabsTrigger>
                    <TabsTrigger value="paste">
                    <PenTool className="w-4 h-4 mr-2" />
                    Paste Resume
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="uploaded">
                  {isAnalyzed ? (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-success flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Resume loaded and ready to use
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground">
                        No resume uploaded. <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/resume-analysis")}>Upload one first</Button>
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="paste">
                  <Textarea
                    placeholder="Paste your resume text here..."
                    value={pastedResume}
                    onChange={(e) => setPastedResume(e.target.value)}
                    className="min-h-[150px]"
                  />
                </TabsContent>
              </Tabs>

              {/* Job Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job Description (Optional)</Label>
                <Textarea
                  placeholder="Paste the job description to make the cover letter more targeted..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Additional Info</Label>
                  <Input
                    placeholder="Any specific points to mention..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div variants={fadeInUp}>
            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-2xl">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Generated Letter
                  </span>
                  {coverLetter && (
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Your AI-generated cover letter will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {coverLetter ? (
                    <motion.div 
                      key="letter"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/50 p-6 rounded-lg">
                        {coverLetter}
                      </pre>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg"
                    >
                      <div className="text-center">
                        <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Fill in the details and click generate</p>
                        <p className="text-sm">Your personalized cover letter will appear here</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default CoverLetter;
