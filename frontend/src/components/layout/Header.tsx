import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Search, 
  Lightbulb, 
  Target, 
  Menu, 
  X,
  Sun,
  Moon,
  Laptop,
  PenTool,
  Bookmark,
  ClipboardList,
  Mic,
  Sparkles
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { motion } from "framer-motion";

const navItems = [
  { href: "/resume-analysis", label: "Resume Analysis", icon: FileText },
  { href: "/job-search", label: "Job Search", icon: Search },
  { href: "/career-insights", label: "Career Insights", icon: Lightbulb },
  { href: "/job-match", label: "Job Match", icon: Target },
  { href: "/cover-letter", label: "Cover Letter", icon: PenTool },
  { href: "/bookmarks", label: "Saved Jobs", icon: Bookmark },
  { href: "/applications", label: "Applications", icon: ClipboardList },
  { href: "/interview-prep", label: "Interview Prep", icon: Mic },
  { href: "/resume-builder", label: "Resume Builder", icon: Sparkles },
];

export function Header() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { isAnalyzed, resumeFilename } = useResumeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <motion.div 
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Agragrati
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive(item.href) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* More dropdown for additional items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>More</span>
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.slice(5).map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Resume Status Badge */}
            {isAnalyzed && (
              <Badge variant="outline" className="hidden sm:flex gap-1 border-success/50 text-success">
                <FileText className="w-3 h-3" />
                {resumeFilename?.slice(0, 15)}...
              </Badge>
            )}

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer">
                  <Laptop className="h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsHelp />

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl">Agragrati</span>
                  </div>
                  
                  {isAnalyzed && (
                    <Badge variant="outline" className="w-fit gap-1 border-success/50 text-success">
                      <FileText className="w-3 h-3" />
                      Resume: {resumeFilename?.slice(0, 20)}
                    </Badge>
                  )}

                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}>
                          <Button
                            variant={isActive(item.href) ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3",
                              isActive(item.href) && "bg-primary/10 text-primary"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
