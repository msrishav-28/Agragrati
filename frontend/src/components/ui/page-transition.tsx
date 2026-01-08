import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

// Fade transition
export const FadeTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Slide up transition
export const SlideUpTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Slide horizontal transition
export const SlideTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Scale transition
export const ScaleTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Default export - can be used as the main page transition
export const PageTransition = SlideUpTransition;

// Motion variants for staggered animations
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Animated list container
export const AnimatedList = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {children}
  </motion.div>
);

// Animated list item
export const AnimatedItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div className={className} variants={itemVariants}>
    {children}
  </motion.div>
);

// Fade in on scroll animation
export const FadeInOnScroll = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

// Hover scale animation wrapper
export const HoverScale = ({ 
  children, 
  scale = 1.02,
  className 
}: { 
  children: ReactNode; 
  scale?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);
