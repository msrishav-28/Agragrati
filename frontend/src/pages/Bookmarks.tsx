import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bookmark, BookmarkX, ExternalLink, Building2, MapPin, 
  Calendar, Search, Trash2, Briefcase, Loader2, PlusCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { 
  getSavedJobs, 
  unsaveJob, 
  SavedJob,
  createApplication 
} from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Bookmarks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    setLoading(true);
    const jobs = await getSavedJobs();
    setSavedJobs(jobs);
    setLoading(false);
  };

  const handleUnsave = async (jobId: string) => {
    const success = await unsaveJob(jobId);
    if (success) {
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast({ title: "Job removed from bookmarks" });
    } else {
      toast({ title: "Failed to remove job", variant: "destructive" });
    }
  };

  const handleAddToApplications = async (job: SavedJob) => {
    const app = await createApplication({
      job_title: job.job_title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      apply_link: job.apply_link,
      status: 'saved',
      applied_date: null,
      interview_date: null,
      notes: job.notes,
      resume_version: '',
      cover_letter: '',
    });

    if (app) {
      toast({ title: "Added to applications!" });
      navigate("/applications");
    } else {
      toast({ title: "Failed to add application", variant: "destructive" });
    }
  };

  const filteredJobs = savedJobs.filter((job) => 
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Your Collection
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Saved Jobs
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Jobs you've bookmarked for later review
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
          {/* Search & Stats */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              {savedJobs.length} saved
            </Badge>
          </motion.div>

          {/* Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <Card className="text-center py-16">
                <CardContent>
                  <BookmarkX className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No saved jobs yet</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ? "No jobs match your search" : "Save jobs from the Job Search page to see them here"}
                </p>
                <Button onClick={() => navigate("/job-search")}>
                  <Search className="w-4 h-4 mr-2" />
                  Search Jobs
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div className="space-y-4" variants={staggerContainer}>
                {filteredJobs.map((job, index) => (
                  <motion.div 
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{job.job_title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Building2 className="w-4 h-4" />
                              {job.company}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{job.source}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          )}
                          {job.job_type && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.job_type}
                            </span>
                          )}
                          {job.salary && (
                            <Badge variant="secondary">{job.salary}</Badge>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Saved {new Date(job.saved_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild size="sm">
                              <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Apply
                              </a>
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddToApplications(job)}
                            >
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Track Application
                            </Button>
                          </motion.div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove from bookmarks?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{job.job_title}" at {job.company} from your saved jobs.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUnsave(job.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </section>
    </Layout>
  );
};

export default Bookmarks;
