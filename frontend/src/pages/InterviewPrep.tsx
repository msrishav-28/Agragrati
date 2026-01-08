import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, Play, Pause, RotateCcw, CheckCircle, AlertCircle,
  Lightbulb, MessageSquare, Brain, Loader2, ThumbsUp, ThumbsDown,
  ChevronRight, Sparkles, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { getInterviewQuestions, evaluateAnswer } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

interface Question {
  question: string;
  category: string;
  difficulty: string;
  tips: string[];
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
}

const InterviewPrep = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumeText, targetRole, isAnalyzed } = useResumeStore();

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [practiceMode, setPracticeMode] = useState<"browse" | "practice">("browse");
  const [customRole, setCustomRole] = useState(targetRole || "");

  const handleGenerateQuestions = async () => {
    if (!resumeText) {
      toast({
        title: "Resume required",
        description: "Please upload your resume first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await getInterviewQuestions(resumeText, customRole || undefined);
      setQuestions(result.questions);
      setCurrentIndex(0);
      setEvaluation(null);
      setUserAnswer("");
      toast({ title: `Generated ${result.questions.length} interview questions!` });
    } catch (error) {
      toast({
        title: "Failed to generate questions",
        description: error instanceof Error ? error.message : "Error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    setEvaluating(true);
    try {
      const result = await evaluateAnswer(
        questions[currentIndex].question,
        userAnswer,
        customRole || undefined
      );
      setEvaluation(result);
    } catch (error) {
      toast({
        title: "Failed to evaluate answer",
        description: error instanceof Error ? error.message : "Error occurred",
        variant: "destructive",
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setEvaluation(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer("");
      setEvaluation(null);
    }
  };

  const currentQuestion = questions[currentIndex];

  if (!isAnalyzed || !resumeText) {
    return (
      <Layout>
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="pt-12 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <Mic className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Resume Required</h2>
                <p className="text-muted-foreground mb-6">
                  Upload your resume to generate personalized interview questions
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => navigate("/resume-analysis")}>
                    Upload Resume
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
              AI Mock Interviews
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Interview Practice
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice with AI-generated questions tailored to your resume and get instant feedback
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Setup */}
          {questions.length === 0 && (
            <Card className="shadow-xl border-2 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Brain className="w-6 h-6 text-primary" />
                  Generate Interview Questions
                </CardTitle>
                <CardDescription>
                  Get personalized questions based on your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Role (Optional)</Label>
                  <Input
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Practice Area */}
          {questions.length > 0 && (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <Badge variant="outline">{currentQuestion?.category}</Badge>
                </div>
                <Progress value={((currentIndex + 1) / questions.length) * 100} />
              </div>

              {/* Mode Toggle */}
              <Tabs value={practiceMode} onValueChange={(v) => setPracticeMode(v as "browse" | "practice")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="browse">Browse Questions</TabsTrigger>
                  <TabsTrigger value="practice">Practice Mode</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Question Card */}
              <Card className="shadow-xl border-2 mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <Badge 
                        variant="outline" 
                        className={
                          currentQuestion?.difficulty === "Easy" ? "border-success text-success" :
                          currentQuestion?.difficulty === "Medium" ? "border-yellow-500 text-yellow-500" :
                          "border-destructive text-destructive"
                        }
                      >
                        {currentQuestion?.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-4">
                    {currentQuestion?.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tips */}
                  {currentQuestion?.tips && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Tips for Answering
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {currentQuestion.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Mode - Answer Input */}
                  {practiceMode === "practice" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Your Answer</Label>
                        <Textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type your answer here... Be specific and use the STAR method for behavioral questions."
                          className="min-h-[150px]"
                        />
                      </div>
                      <Button
                        onClick={handleEvaluateAnswer}
                        disabled={evaluating || !userAnswer.trim()}
                        className="w-full"
                      >
                        {evaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Evaluate My Answer
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Evaluation Results */}
                  {evaluation && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">Feedback</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold">{evaluation.score}</span>
                          <span className="text-muted-foreground">/10</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-success/10 rounded-lg p-4">
                          <h5 className="font-medium flex items-center gap-2 text-success mb-2">
                            <ThumbsUp className="w-4 h-4" />
                            Strengths
                          </h5>
                          <ul className="space-y-1 text-sm">
                            {evaluation.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 text-success shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-4">
                          <h5 className="font-medium flex items-center gap-2 text-destructive mb-2">
                            <ThumbsDown className="w-4 h-4" />
                            Areas to Improve
                          </h5>
                          <ul className="space-y-1 text-sm">
                            {evaluation.improvements.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {evaluation.sample_answer && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h5 className="font-medium flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Sample Strong Answer
                          </h5>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {evaluation.sample_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuestions([]);
                      setCurrentIndex(0);
                      setEvaluation(null);
                      setUserAnswer("");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Questions
                  </Button>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentIndex === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </section>
    </Layout>
  );
};

export default InterviewPrep;
