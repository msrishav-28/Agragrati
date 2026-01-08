import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, FileText, Plus, Trash2, GripVertical, Download,
  Eye, Edit2, Loader2, Wand2, CheckCircle, Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { enhanceResumeSection } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface ResumeSection {
  id: string;
  type: string;
  title: string;
  content: string;
}

const sectionTypes = [
  { value: "summary", label: "Professional Summary" },
  { value: "experience", label: "Work Experience" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "projects", label: "Projects" },
  { value: "certifications", label: "Certifications" },
  { value: "achievements", label: "Achievements" },
  { value: "languages", label: "Languages" },
  { value: "interests", label: "Interests" },
];

const defaultSections: ResumeSection[] = [
  { id: "1", type: "summary", title: "Professional Summary", content: "" },
  { id: "2", type: "experience", title: "Work Experience", content: "" },
  { id: "3", type: "education", title: "Education", content: "" },
  { id: "4", type: "skills", title: "Skills", content: "" },
];

const ResumeBuilder = () => {
  const { toast } = useToast();
  const { targetRole } = useResumeStore();

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  });
  const [sections, setSections] = useState<ResumeSection[]>(defaultSections);
  const [enhancingSection, setEnhancingSection] = useState<string | null>(null);
  const [jobTarget, setJobTarget] = useState(targetRole || "");

  const addSection = () => {
    const newSection: ResumeSection = {
      id: Date.now().toString(),
      type: "experience",
      title: "New Section",
      content: "",
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<ResumeSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleEnhanceSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.content.trim()) {
      toast({
        title: "Add content first",
        description: "Write something in the section before enhancing",
        variant: "destructive",
      });
      return;
    }

    setEnhancingSection(sectionId);
    try {
      const result = await enhanceResumeSection(
        section.type,
        section.content,
        jobTarget || undefined
      );
      updateSection(sectionId, { content: result.enhanced_content });
      toast({ title: "Section enhanced!" });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Error occurred",
        variant: "destructive",
      });
    } finally {
      setEnhancingSection(null);
    }
  };

  const generateResumeText = () => {
    let text = "";
    
    // Header
    if (personalInfo.name) text += `${personalInfo.name.toUpperCase()}\n`;
    const contactInfo = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
    if (contactInfo.length) text += contactInfo.join(" | ") + "\n";
    const links = [personalInfo.linkedin, personalInfo.website].filter(Boolean);
    if (links.length) text += links.join(" | ") + "\n";
    text += "\n";

    // Sections
    sections.forEach((section) => {
      if (section.content.trim()) {
        text += `${"=".repeat(40)}\n`;
        text += `${section.title.toUpperCase()}\n`;
        text += `${"=".repeat(40)}\n`;
        text += section.content + "\n\n";
      }
    });

    return text;
  };

  const handleDownload = () => {
    const text = generateResumeText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume_${personalInfo.name.replace(/\s+/g, "_") || "draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Resume downloaded!" });
  };

  const handleCopy = () => {
    const text = generateResumeText();
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
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
              Resume Builder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create a professional resume from scratch with AI-enhanced content
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
          {/* Toolbar */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder="Target job role (optional)"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
            <TabsList className="mb-6">
              <TabsTrigger value="edit" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={personalInfo.website}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Sections */}
              {sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                        <Select
                          value={section.type}
                          onValueChange={(v) => {
                            const typeLabel = sectionTypes.find((t) => t.value === v)?.label || v;
                            updateSection(section.id, { type: v, title: typeLabel });
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sectionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnhanceSection(section.id)}
                          disabled={enhancingSection === section.id}
                        >
                          {enhancingSection === section.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Enhance with AI
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSection(section.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      placeholder={`Enter your ${section.title.toLowerCase()} here...`}
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {section.type === "experience" && "Include: Company, Role, Dates, Achievements with metrics"}
                      {section.type === "education" && "Include: Degree, Institution, Year, Relevant coursework"}
                      {section.type === "skills" && "List technical skills, tools, languages, frameworks"}
                      {section.type === "summary" && "2-3 sentences highlighting your experience and goals"}
                      {section.type === "projects" && "Include: Project name, technologies, your role, impact"}
                    </p>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addSection} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="min-h-[600px]">
                <CardContent className="p-8">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {/* Header */}
                    <div className="text-center border-b pb-4 mb-6">
                      <h1 className="text-3xl font-bold mb-2">{personalInfo.name || "Your Name"}</h1>
                      <p className="text-muted-foreground">
                        {[personalInfo.email, personalInfo.phone, personalInfo.location]
                          .filter(Boolean)
                          .join(" • ") || "your@email.com • (555) 123-4567 • City, State"}
                      </p>
                      {(personalInfo.linkedin || personalInfo.website) && (
                        <p className="text-muted-foreground text-sm">
                          {[personalInfo.linkedin, personalInfo.website].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </div>

                    {/* Sections */}
                    {sections.map((section) => (
                      section.content.trim() && (
                        <div key={section.id} className="mb-6">
                          <h2 className="text-lg font-bold uppercase border-b pb-1 mb-3">
                            {section.title}
                          </h2>
                          <div className="whitespace-pre-wrap text-sm">
                            {section.content}
                          </div>
                        </div>
                      )
                    ))}

                    {sections.every((s) => !s.content.trim()) && (
                      <div className="text-center text-muted-foreground py-20">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Start adding content to see your resume preview</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>
    </Layout>
  );
};

export default ResumeBuilder;
