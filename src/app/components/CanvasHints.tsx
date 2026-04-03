"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "rabbithole-hints-seen";

const HINTS = [
  { icon: "👆", text: "Click a card to see more" },
  { icon: "✋", text: "Drag cards to rearrange" },
  { icon: "🔗", text: "Click the dot to rewire connections" },
  { icon: "📖", text: "Click the quote below to read the full story" },
];

export default function CanvasHints() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const showTimer = setTimeout(() => setVisible(true), 1800);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }, 9000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          onClick={dismiss}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 cursor-pointer"
        >
          <div className="flex items-center gap-5 px-6 py-3.5 bg-surface-frosted backdrop-blur-md border border-brand-subtle rounded-2xl shadow-lg shadow-black/5">
            {HINTS.map((hint) => (
              <div
                key={hint.text}
                className="flex items-center gap-2 text-sm text-text-secondary font-body whitespace-nowrap"
              >
                <span className="text-base select-none">{hint.icon}</span>
                <span>{hint.text}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-text-faint mt-2 font-body">
            Click anywhere to dismiss
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
