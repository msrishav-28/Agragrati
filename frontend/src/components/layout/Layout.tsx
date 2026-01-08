import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          className="pb-20 lg:pb-0"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <MobileNav />
    </div>
  );
}

export default Layout;
