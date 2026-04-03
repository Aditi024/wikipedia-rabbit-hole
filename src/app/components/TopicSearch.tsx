"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchResult } from "@/lib/wikipedia";

interface TopicSearchProps {
  onSelect: (title: string) => void;
}

export default function TopicSearch({ onSelect }: TopicSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = (title: string) => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onSelect(title);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Start from a topic..."
          className="w-full px-5 py-3.5 rounded-full bg-white/80 backdrop-blur-sm border border-brand-subtle text-foreground placeholder:text-text-faint text-base font-body focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand/10 transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 rounded-full border-2 border-brand-light border-t-brand"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md border border-brand-subtle rounded-2xl shadow-lg shadow-black/8 overflow-hidden z-50"
          >
            {results.map((r) => (
              <button
                key={r.title}
                onClick={() => handleSelect(r.title)}
                className="w-full px-5 py-3 text-left hover:bg-brand/5 transition-colors border-b border-foreground/5 last:border-b-0"
              >
                <p className="text-sm font-semibold text-foreground font-body truncate">
                  {r.title}
                </p>
                {r.description && (
                  <p className="text-xs text-text-muted font-body mt-0.5 truncate">
                    {r.description}
                  </p>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && results.length > 0 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
