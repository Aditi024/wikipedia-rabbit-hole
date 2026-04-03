"use client";

import { useEffect } from "react";
import ExploreButton from "@/app/components/ExploreButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-5xl select-none">🐇</p>
      <h1 className="text-2xl font-bold text-foreground font-display">
        Something went wrong
      </h1>
      <p className="text-text-secondary font-body max-w-sm">
        The rabbit hole collapsed unexpectedly. You can try again or start
        fresh.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-surface-glass text-foreground border border-brand-light hover:bg-surface-translucent transition-all font-body"
        >
          Try again
        </button>
        <ExploreButton href="/" label="Start over" variant="small" />
      </div>
    </div>
  );
}
