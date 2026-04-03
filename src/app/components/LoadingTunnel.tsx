"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Tunneling through Wikipedia...",
  "Following a curious link...",
  "Discovering something obscure...",
  "Connecting the dots...",
  "Going deeper...",
];

const RING_COUNT = 6;

export default function LoadingTunnel() {
  const [msgIndex, setMsgIndex] = useState(0);

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
      className="flex flex-col items-center justify-center gap-10"
    >
      <div className="relative flex items-center justify-center w-52 h-52">
        {Array.from({ length: RING_COUNT }, (_, i) => {
          const size = 200 - i * 30;
          const opacity = 0.04 + i * 0.04;
          const delay = i * 0.12;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-brand"
              style={{
                width: size,
                height: size,
                opacity,
              }}
              animate={{
                scale: [1, 0.88, 1],
                opacity: [opacity, opacity + 0.06, opacity],
              }}
              transition={{
                duration: 2.4,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        <motion.div
          className="w-5 h-5 rounded-full bg-brand"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative h-7 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
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
