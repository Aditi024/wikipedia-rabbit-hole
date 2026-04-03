"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DRIFT_WORDS = [
  "entropy", "cartography", "mitochondria", "linguistics",
  "alchemy", "fjord", "tessellation", "archipelago",
  "synesthesia", "calculus", "renaissance", "metamorphosis",
  "bioluminescence", "palindrome", "obsidian", "parallax",
  "serendipity", "quasar", "mycelium", "ephemeral",
  "heliocentric", "origami", "cryptography", "solstice",
  "phosphorescence", "labyrinth", "osmosis", "paradox",
  "fibonacci", "silhouette", "tectonic", "algorithm",
];

const MESSAGES = [
  "Tunneling through Wikipedia...",
  "Following a curious link...",
  "Discovering something obscure...",
  "Connecting the dots...",
  "Going deeper...",
];

const RING_COUNT = 5;

interface DriftWord {
  id: number;
  word: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

function generateDriftWords(count: number): DriftWord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    word: DRIFT_WORDS[Math.floor(Math.random() * DRIFT_WORDS.length)],
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: Math.random() * 14 + 10,
    opacity: Math.random() * 0.25 + 0.05,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
  }));
}

export default function LoadingTunnel() {
  const [msgIndex, setMsgIndex] = useState(0);
  const driftWords = useMemo(() => generateDriftWords(12), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-8 relative"
      style={{ width: "min(90vw, 500px)", height: "min(70vh, 500px)" }}
    >
      {/* Drifting words */}
      {driftWords.map((dw) => (
        <motion.span
          key={dw.id}
          className="absolute font-display text-brand select-none pointer-events-none"
          style={{
            fontSize: dw.size,
            left: `${dw.x}%`,
            top: `${dw.y}%`,
          }}
          initial={{ opacity: 0, scale: 1.5 }}
          animate={{
            opacity: [0, dw.opacity, dw.opacity, 0],
            scale: [1.5, 1, 0.8, 0.3],
            x: [0, 0, 0, 0],
            y: [0, 0, 10, 30],
          }}
          transition={{
            duration: dw.duration,
            delay: dw.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1,
            ease: "easeInOut",
          }}
        >
          {dw.word}
        </motion.span>
      ))}

      {/* Concentric rings */}
      <div className="relative flex items-center justify-center">
        {Array.from({ length: RING_COUNT }, (_, i) => {
          const size = 220 - i * 36;
          const delay = i * 0.15;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: size,
                height: size,
                borderColor: `rgba(239, 57, 34, ${0.08 + i * 0.06})`,
              }}
              animate={{
                scale: [1, 0.85, 1],
                opacity: [0.3 + i * 0.12, 0.6 + i * 0.08, 0.3 + i * 0.12],
              }}
              transition={{
                duration: 2.5,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Center dot */}
        <motion.div
          className="w-3 h-3 rounded-full bg-brand"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Loading message */}
      <div className="relative z-10 h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
            className="text-text-primary text-base font-medium font-body absolute whitespace-nowrap"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
