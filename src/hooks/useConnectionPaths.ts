import { useState, useRef, useEffect } from "react";
import { Connection } from "@/lib/types";
import { ConnectionPath } from "@/app/components/ConnectionLines";

function getPortCenter(el: Element, canvasRect: DOMRect) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - canvasRect.left,
    y: rect.top + rect.height / 2 - canvasRect.top,
  };
}

function computeBezierPath(
  out: { x: number; y: number },
  inp: { x: number; y: number }
): string {
  const dx = inp.x - out.x;
  const absDx = Math.abs(dx);
  const dy = inp.y - out.y;

  let handleLen: number;
  if (dx > 0) {
    handleLen = Math.min(Math.max(absDx * 0.45, 60), 200);
  } else {
    handleLen = Math.min(
      Math.max(absDx * 0.5 + Math.abs(dy) * 0.3, 100),
      300
    );
  }

  return `M ${out.x} ${out.y} C ${out.x + handleLen} ${out.y}, ${inp.x - handleLen} ${inp.y}, ${inp.x} ${inp.y}`;
}

interface UseConnectionPathsOptions {
  connections: Connection[];
  canvasRef: React.RefObject<HTMLDivElement | null>;
  nodeRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export function useConnectionPaths({
  connections,
  canvasRef,
  nodeRefs,
}: UseConnectionPathsOptions) {
  const [connectionPaths, setConnectionPaths] = useState<ConnectionPath[]>([]);
  const rafRef = useRef<number>(0);
  const prevPathsRef = useRef<string>("");

  useEffect(() => {
    const tick = () => {
      const canvas = canvasRef.current;
      if (canvas && connections.length > 0) {
        const canvasRect = canvas.getBoundingClientRect();
        const paths: ConnectionPath[] = [];

        for (const conn of connections) {
          const fromEl = nodeRefs.current[conn.from];
          const toEl = nodeRefs.current[conn.to];
          if (!fromEl || !toEl) continue;

          const outputPort = fromEl.querySelector('[data-port="output"]');
          const inputPort = toEl.querySelector('[data-port="input"]');
          if (!outputPort || !inputPort) continue;

          const out = getPortCenter(outputPort, canvasRect);
          const inp = getPortCenter(inputPort, canvasRect);

          paths.push({
            id: `${conn.from}-${conn.to}`,
            path: computeBezierPath(out, inp),
            fromIndex: conn.from,
            toIndex: conn.to,
          });
        }

        const key = paths.map((p) => p.path).join("|");
        if (key !== prevPathsRef.current) {
          prevPathsRef.current = key;
          setConnectionPaths(paths);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connections, canvasRef, nodeRefs]);

  return connectionPaths;
}
