import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Briefcase, MapPin, Building2, ExternalLink, Download, Sparkles, Filter, Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { searchJobs, searchJobsByResume, type Job } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { saveJob, isJobSaved } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

const JobSearch = () => {
  const { toast } = useToast();
  const { resumeText, isAnalyzed } = useResumeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("United States");
  const [jobType, setJobType] = useState("any");
  const [resultsCount, setResultsCount] = useState(20);
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchMode, setSearchMode] = useState<"smart" | "manual">("manual");
  
  // Filters
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const handleSearch = async () => {
    if (searchMode === "manual" && !searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a job title or keywords",
        variant: "destructive",
      });
      return;
    }

    if (searchMode === "smart" && !resumeText) {
      toast({
        title: "Resume required",
        description: "Please upload and analyze your resume first",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const jobTypeParam = jobType === "any" ? undefined : jobType;
      
      let result;
      if (searchMode === "smart" && resumeText) {
        result = await searchJobsByResume(resumeText, location, resultsCount, jobTypeParam);
      } else {
        result = await searchJobs(searchTerm, location, resultsCount, jobTypeParam);
      }

      setJobs(result.jobs);
      toast({
        title: "Search complete",
        description: `Found ${result.count} job opportunities`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to search jobs",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  // Get unique companies and sources for filters
  const companies = ["all", ...new Set(jobs.map(j => j.Company).filter(Boolean))];
  const sources = ["all", ...new Set(jobs.map(j => j.Source).filter(Boolean))];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (companyFilter !== "all" && job.Company !== companyFilter) return false;
    if (sourceFilter !== "all" && job.Source !== sourceFilter) return false;
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (filteredJobs.length === 0) return;

    const headers = ["Job Title", "Company", "Location", "Job Type", "Salary", "Date Posted", "Apply Link", "Source"];
    const csvContent = [
      headers.join(","),
      ...filteredJobs.map(job =>
        headers.map(h => {
          const value = job[h as keyof Job] || "";
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job_search_results.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `Exported ${filteredJobs.length} jobs to CSV`,
    });
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
              Real Job Opportunities
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Job Search
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover opportunities from multiple platforms with AI-powered matching
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
                  <Search className="w-6 h-6 text-primary" />
                  Find Your Next Role
                </CardTitle>
                <CardDescription>
                  Search manually or let AI find jobs matching your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Mode Tabs */}
                <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "smart" | "manual")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="smart" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Smart Search (Resume-Based)
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Manual Search
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="smart" className="space-y-4">
                    {isAnalyzed && resumeText ? (
                      <motion.div 
                        className="p-4 bg-success/10 border border-success/20 rounded-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <p className="text-success flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Resume loaded! AI will extract skills and find matching jobs.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <p className="text-destructive">
                          ⚠️ Please upload and analyze your resume first to use Smart Search.
                        </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Job Title or Keywords</Label>
                    <Input
                      placeholder="e.g., Software Engineer, Data Analyst, Product Manager"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Common Filters */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Results</Label>
                  <Select value={String(resultsCount)} onValueChange={(v) => setResultsCount(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 results</SelectItem>
                      <SelectItem value="20">20 results</SelectItem>
                      <SelectItem value="30">30 results</SelectItem>
                      <SelectItem value="50">50 results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={searching || (searchMode === "smart" && !resumeText)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                size="lg"
              >
                {searching ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Jobs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {jobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-xl border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Briefcase className="w-6 h-6 text-primary" />
                          Job Results
                        </CardTitle>
                        <CardDescription>
                          Found {jobs.length} opportunities • Showing {filteredJobs.length} after filters
                        </CardDescription>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" onClick={exportToCSV} disabled={filteredJobs.length === 0}>
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Result Filters */}
                    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Company:</Label>
                        <Select value={companyFilter} onValueChange={setCompanyFilter}>
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map(c => (
                              <SelectItem key={c} value={c}>
                                {c === "all" ? "All Companies" : c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Source:</Label>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sources.map(s => (
                              <SelectItem key={s} value={s}>
                                {s === "all" ? "All Sources" : s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Job Cards (Mobile) / Table (Desktop) */}
                    <div className="hidden md:block">
                      <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{job["Job Title"]}</TableCell>
                          <TableCell>{job.Company}</TableCell>
                          <TableCell>{job.Location}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{job["Job Type"]}</Badge>
                          </TableCell>
                          <TableCell className="text-success">{job.Salary}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.Source}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={job["Apply Link"]} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredJobs.map((job, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{job["Job Title"]}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {job.Company}
                            </p>
                          </div>
                          <Badge variant="outline">{job.Source}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />
                          {job.Location}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{job["Job Type"]}</Badge>
                            <span className="text-sm text-success">{job.Salary}</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={job["Apply Link"]} target="_blank" rel="noopener noreferrer">
                              Apply <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredJobs.length === 0 && jobs.length > 0 && (
                  <motion.div 
                    className="text-center py-8 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No jobs match your current filters. Try adjusting them.
                  </motion.div>
                )}
              </CardContent>
            </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </Layout>
  );
};

export default JobSearch;
