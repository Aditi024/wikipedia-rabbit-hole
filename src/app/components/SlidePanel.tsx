"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION } from "@/lib/config";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}

export default function SlidePanel({
  open,
  onClose,
  maxWidth = "max-w-md",
  children,
}: SlidePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-overlay backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            {...ANIMATION.slideRight}
            className={`fixed right-0 top-0 bottom-0 w-full ${maxWidth} bg-surface-frosted backdrop-blur-lg border-l border-brand-subtle z-50 overflow-y-auto`}
          >
            <div className="p-8">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-text-muted hover:text-foreground transition-colors text-lg"
              >
                &times;
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
