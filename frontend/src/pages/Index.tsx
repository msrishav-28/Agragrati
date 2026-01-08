import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Lightbulb, Target, Sparkles, TrendingUp, Award, ArrowRight, CheckCircle, Zap, Brain, Briefcase, PenTool, Bookmark, ClipboardList, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResumeStore } from "@/store/useResumeStore";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

const Index = () => {
  const navigate = useNavigate();
  const { isAnalyzed, analysisResult, resumeFilename } = useResumeStore();

  const features = [
    {
      icon: FileText,
      title: "Resume Analysis",
      description: "Get AI-powered insights to optimize your resume for ATS systems and recruiters",
      href: "/resume-analysis",
      color: "primary",
      stats: isAnalyzed ? `Score: ${analysisResult?.match_score || 'N/A'}` : "Start here",
    },
    {
      icon: Search,
      title: "Job Search",
      description: "Find real job opportunities from multiple sources tailored to your skills",
      href: "/job-search",
      color: "accent",
      stats: "Real-time listings",
    },
    {
      icon: Lightbulb,
      title: "Career Insights",
      description: "Discover career paths, skill gaps, salary trends, and learning resources",
      href: "/career-insights",
      color: "success",
      stats: "6 insight categories",
    },
    {
      icon: Target,
      title: "Job Match",
      description: "Compare your resume against specific job descriptions for match scoring",
      href: "/job-match",
      color: "primary",
      stats: "Keyword analysis",
    },
    {
      icon: PenTool,
      title: "Cover Letter",
      description: "Generate personalized cover letters tailored to each job application",
      href: "/cover-letter",
      color: "accent",
      stats: "AI-generated",
    },
    {
      icon: Mic,
      title: "Interview Prep",
      description: "Practice with AI-generated questions and get instant feedback",
      href: "/interview-prep",
      color: "success",
      stats: "Mock interviews",
    },
    {
      icon: Bookmark,
      title: "Saved Jobs",
      description: "Access your bookmarked jobs and track your favorites",
      href: "/bookmarks",
      color: "primary",
      stats: "Your collection",
    },
    {
      icon: ClipboardList,
      title: "Applications",
      description: "Track all your job applications and their status in one place",
      href: "/applications",
      color: "accent",
      stats: "Track progress",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                AI-Powered Career Platform
              </Badge>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Agragrati
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-4"
              variants={fadeInUp}
            >
              AI Resume Analysis & Job Search Platform
            </motion.p>
            <motion.p 
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Upload your resume to receive intelligent feedback and discover real job opportunities tailored to your skills
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8"
                onClick={() => navigate("/resume-analysis")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Your Resume
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
                onClick={() => navigate("/job-search")}
              >
                <Search className="w-5 h-5 mr-2" />
                Search Jobs
              </Button>
            </motion.div>

            {/* Status Badge */}
            {isAnalyzed && (
              <motion.div 
                className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-success font-medium">
                  Resume loaded: {resumeFilename}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-muted-foreground">Everything you need to supercharge your job search</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={scaleIn}>
                  <Card 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 h-full"
                    onClick={() => navigate(feature.href)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <motion.div 
                          className={`w-12 h-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className={`w-6 h-6 text-${feature.color}`} />
                        </motion.div>
                        <Badge variant="secondary" className="text-xs">
                          {feature.stats}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="group-hover:bg-primary/10 group-hover:text-primary">
                        Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "AI", sublabel: "Powered Analysis", color: "primary" },
              { icon: Briefcase, label: "Real", sublabel: "Job Listings", color: "accent" },
              { icon: Brain, label: "6+", sublabel: "Career Insights", color: "success" },
              { icon: TrendingUp, label: "ATS", sublabel: "Optimization", color: "primary" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={scaleIn}>
                  <Card className={`text-center bg-gradient-to-br from-${stat.color}/5 to-transparent hover:shadow-lg transition-shadow`}>
                    <CardContent className="pt-6">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className={`w-8 h-8 text-${stat.color} mx-auto mb-2`} />
                      </motion.div>
                      <div className="text-3xl font-bold">{stat.label}</div>
                      <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to accelerate your career</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { num: 1, title: "Upload Resume", desc: "Upload your PDF or TXT resume for AI analysis", color: "primary" },
              { num: 2, title: "Get Insights", desc: "Receive detailed feedback and career recommendations", color: "accent" },
              { num: 3, title: "Find Jobs", desc: "Discover real opportunities matched to your skills", color: "success" },
            ].map((step) => (
              <motion.div key={step.num} className="text-center" variants={fadeInUp}>
                <motion.div 
                  className={`w-16 h-16 rounded-full bg-${step.color}/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-${step.color}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {step.num}
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/20">
            <CardContent className="py-12 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Career?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who have improved their resumes and found better opportunities
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8"
                  onClick={() => navigate("/resume-analysis")}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Analysis
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Agragrati</p>
            <p className="text-sm">AI-Powered Resume Analysis & Job Search Platform</p>
            <p className="text-xs mt-4">Powered by Groq AI (Llama 3.3 70B)</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
