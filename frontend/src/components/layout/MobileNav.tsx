import { Link, useLocation } from "react-router-dom";
import { 
  FileText, 
  Search, 
  Home,
  Bookmark,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/resume-analysis", label: "Resume", icon: FileText },
  { href: "/job-search", label: "Jobs", icon: Search },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
];

const moreItems = [
  { href: "/career-insights", label: "Career Insights" },
  { href: "/job-match", label: "Job Match" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/applications", label: "Applications" },
  { href: "/interview-prep", label: "Interview Prep" },
  { href: "/resume-builder", label: "Resume Builder" },
];

export function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <nav className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className={cn("w-5 h-5", active && "text-primary")} />
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
        
        {/* More Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <motion.button 
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-3xl">
            <motion.div 
              className="grid grid-cols-2 gap-2 pt-4 pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {moreItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={item.href} onClick={() => setOpen(false)}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "outline"}
                      className={cn(
                        "w-full justify-start",
                        isActive(item.href) && "bg-primary/10 text-primary border-primary/50"
                      )}
                    >
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.div>
  );
}

export default MobileNav;
