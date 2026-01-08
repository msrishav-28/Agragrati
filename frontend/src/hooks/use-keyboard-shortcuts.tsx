import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: ShortcutConfig[];
}

// Default keyboard shortcuts for the app
export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const { enabled = true, shortcuts: customShortcuts = [] } = options;
  const navigate = useNavigate();

  // Default shortcuts
  const defaultShortcuts: ShortcutConfig[] = [
    { key: "h", alt: true, action: () => navigate("/"), description: "Go to Home" },
    { key: "r", alt: true, action: () => navigate("/resume-analysis"), description: "Go to Resume Analysis" },
    { key: "j", alt: true, action: () => navigate("/job-search"), description: "Go to Job Search" },
    { key: "m", alt: true, action: () => navigate("/job-match"), description: "Go to Job Match" },
    { key: "c", alt: true, action: () => navigate("/career-insights"), description: "Go to Career Insights" },
    { key: "l", alt: true, action: () => navigate("/cover-letter"), description: "Go to Cover Letter" },
    { key: "i", alt: true, action: () => navigate("/interview-prep"), description: "Go to Interview Prep" },
    { key: "b", alt: true, action: () => navigate("/bookmarks"), description: "Go to Bookmarks" },
    { key: "a", alt: true, action: () => navigate("/applications"), description: "Go to Applications" },
    { key: "/", ctrl: true, action: () => {
      // Focus search input if exists
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, description: "Focus search" },
    { key: "Escape", action: () => {
      // Close any open modals or dropdowns
      const closeButton = document.querySelector('[data-state="open"] [data-dismiss]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
      // Blur focused input
      (document.activeElement as HTMLElement)?.blur?.();
    }, description: "Close modal / Unfocus" },
  ];

  // Merge default and custom shortcuts
  const allShortcuts = [...defaultShortcuts, ...customShortcuts];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields (except for Escape)
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === "INPUT" || 
                         target.tagName === "TEXTAREA" || 
                         target.isContentEditable;
    
    if (isInputField && event.key !== "Escape") {
      return;
    }

    for (const shortcut of allShortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [enabled, allShortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: allShortcuts,
    formatShortcut: (shortcut: ShortcutConfig) => {
      const parts: string[] = [];
      if (shortcut.ctrl) parts.push("Ctrl");
      if (shortcut.alt) parts.push("Alt");
      if (shortcut.shift) parts.push("Shift");
      parts.push(shortcut.key.toUpperCase());
      return parts.join(" + ");
    },
  };
};

// Hook for custom page-specific shortcuts
export const useCustomShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const isInputField = target.tagName === "INPUT" || 
                         target.tagName === "TEXTAREA" || 
                         target.isContentEditable;
    
    if (isInputField && event.key !== "Escape") {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

// Keyboard shortcut help display component data
export const getShortcutHelp = () => [
  { category: "Navigation", shortcuts: [
    { keys: "Alt + H", description: "Go to Home" },
    { keys: "Alt + R", description: "Go to Resume Analysis" },
    { keys: "Alt + J", description: "Go to Job Search" },
    { keys: "Alt + M", description: "Go to Job Match" },
    { keys: "Alt + C", description: "Go to Career Insights" },
    { keys: "Alt + L", description: "Go to Cover Letter" },
    { keys: "Alt + I", description: "Go to Interview Prep" },
    { keys: "Alt + B", description: "Go to Bookmarks" },
    { keys: "Alt + A", description: "Go to Applications" },
  ]},
  { category: "Actions", shortcuts: [
    { keys: "Ctrl + /", description: "Focus search input" },
    { keys: "Escape", description: "Close modal / Unfocus input" },
  ]},
];
