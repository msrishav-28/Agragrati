import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import JobSearch from "./pages/JobSearch";
import CareerInsights from "./pages/CareerInsights";
import JobMatch from "./pages/JobMatch";
import CoverLetter from "./pages/CoverLetter";
import Bookmarks from "./pages/Bookmarks";
import Applications from "./pages/Applications";
import InterviewPrep from "./pages/InterviewPrep";
import ResumeBuilder from "./pages/ResumeBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Keyboard shortcuts wrapper component
const KeyboardShortcutsProvider = ({ children }: { children: React.ReactNode }) => {
  // Import dynamically to avoid issues during SSR/initial render
  const { useKeyboardShortcuts } = require("@/hooks/use-keyboard-shortcuts");
  useKeyboardShortcuts();
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="agragrati-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <KeyboardShortcutsProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/resume-analysis" element={<ResumeAnalysis />} />
                <Route path="/job-search" element={<JobSearch />} />
                <Route path="/career-insights" element={<CareerInsights />} />
                <Route path="/job-match" element={<JobMatch />} />
                <Route path="/cover-letter" element={<CoverLetter />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/interview-prep" element={<InterviewPrep />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </KeyboardShortcutsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
