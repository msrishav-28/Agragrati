import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ClipboardList, Plus, Building2, MapPin, Calendar, 
  ExternalLink, Edit2, Trash2, Loader2, CheckCircle,
  Clock, XCircle, Trophy, Send, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { 
  getApplications, 
  createApplication, 
  updateApplication,
  deleteApplication,
  JobApplication 
} from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const statusConfig = {
  saved: { label: "Saved", icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  applied: { label: "Applied", icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
  interviewing: { label: "Interviewing", icon: Calendar, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  offered: { label: "Offered", icon: Trophy, color: "text-success", bg: "bg-success/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  withdrawn: { label: "Withdrawn", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
};

type Status = keyof typeof statusConfig;

const Applications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    job_title: "",
    company: "",
    location: "",
    salary: "",
    apply_link: "",
    status: "saved" as Status,
    applied_date: "",
    interview_date: "",
    notes: "",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const apps = await getApplications();
    setApplications(apps);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      job_title: "",
      company: "",
      location: "",
      salary: "",
      apply_link: "",
      status: "saved",
      applied_date: "",
      interview_date: "",
      notes: "",
    });
    setEditingApp(null);
  };

  const handleSubmit = async () => {
    if (!formData.job_title || !formData.company) {
      toast({ title: "Please fill in job title and company", variant: "destructive" });
      return;
    }

    if (editingApp) {
      const updated = await updateApplication(editingApp.id, {
        ...formData,
        applied_date: formData.applied_date || null,
        interview_date: formData.interview_date || null,
      });
      if (updated) {
        setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? updated : a)));
        toast({ title: "Application updated!" });
      }
    } else {
      const created = await createApplication({
        ...formData,
        applied_date: formData.applied_date || null,
        interview_date: formData.interview_date || null,
        resume_version: "",
        cover_letter: "",
      });
      if (created) {
        setApplications((prev) => [created, ...prev]);
        toast({ title: "Application added!" });
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      job_title: app.job_title,
      company: app.company,
      location: app.location || "",
      salary: app.salary || "",
      apply_link: app.apply_link || "",
      status: app.status,
      applied_date: app.applied_date?.split("T")[0] || "",
      interview_date: app.interview_date?.split("T")[0] || "",
      notes: app.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteApplication(id);
    if (success) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Application deleted" });
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    const updates: Partial<JobApplication> = { status };
    if (status === "applied" && !applications.find((a) => a.id === id)?.applied_date) {
      updates.applied_date = new Date().toISOString();
    }
    const updated = await updateApplication(id, updates);
    if (updated) {
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast({ title: `Status updated to ${statusConfig[status].label}` });
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || app.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: applications.length };
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

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
              Track Your Progress
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Application Tracker
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Keep track of all your job applications in one place
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Stats Cards */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" variants={fadeInUp}>
            {Object.entries(statusConfig).slice(0, 4).map(([key, config], index) => {
              const Icon = config.icon;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${activeTab === key ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{statusCounts[key] || 0}</p>
                          <p className="text-sm text-muted-foreground">{config.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Toolbar */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingApp ? "Edit Application" : "Add New Application"}</DialogTitle>
                  <DialogDescription>
                    {editingApp ? "Update the details of this application" : "Track a new job application"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Google"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Salary</Label>
                      <Input
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="$150,000 - $180,000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Apply Link</Label>
                    <Input
                      value={formData.apply_link}
                      onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(v) => setFormData({ ...formData, status: v as Status })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Applied Date</Label>
                      <Input
                        type="date"
                        value={formData.applied_date}
                        onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interview Date</Label>
                      <Input
                        type="date"
                        value={formData.interview_date}
                        onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>
                    {editingApp ? "Update" : "Add"} Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">
                All ({statusCounts.all || 0})
              </TabsTrigger>
              {Object.entries(statusConfig).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="gap-1">
                  {config.label} ({statusCounts[key] || 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Applications List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredApps.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <Card className="text-center py-16">
                <CardContent>
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start tracking your job applications
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Application
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div className="space-y-4">
                {filteredApps.map((app, index) => {
                  const StatusIcon = statusConfig[app.status].icon;
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{app.job_title}</h3>
                                <Badge className={`${statusConfig[app.status].bg} ${statusConfig[app.status].color} border-0`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig[app.status].label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {app.company}
                                </span>
                                {app.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {app.location}
                                  </span>
                                )}
                                {app.applied_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Applied {new Date(app.applied_date).toLocaleDateString()}
                              </span>
                            )}
                            {app.salary && <Badge variant="secondary">{app.salary}</Badge>}
                          </div>
                          {app.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{app.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={app.status} onValueChange={(v) => handleStatusChange(app.id, v as Status)}>
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {app.apply_link && (
                            <Button variant="outline" size="icon" asChild>
                              <a href={app.apply_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="icon" onClick={() => handleEdit(app)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete application?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this application record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(app.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </section>
    </Layout>
  );
};

export default Applications;
