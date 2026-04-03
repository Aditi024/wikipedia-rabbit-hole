import { useState, useRef, useCallback, useEffect } from "react";
import { Connection } from "@/lib/types";

function getPortCenter(el: Element, canvasRect: DOMRect) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - canvasRect.left,
    y: rect.top + rect.height / 2 - canvasRect.top,
  };
}

interface UseWiringOptions {
  connections: Connection[];
  onConnectionsChange: (connections: Connection[]) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  nodeRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export function useWiring({
  connections,
  onConnectionsChange,
  canvasRef,
  nodeRefs,
}: UseWiringOptions) {
  const [wiringFrom, setWiringFrom] = useState<number | null>(null);
  const wiringFromRef = useRef<number | null>(null);
  const [pendingLine, setPendingLine] = useState<string | null>(null);
  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;
  const onConnectionsChangeRef = useRef(onConnectionsChange);
  onConnectionsChangeRef.current = onConnectionsChange;

  const handlePortClick = useCallback((cardIndex: number) => {
    if (wiringFromRef.current !== null) return;
    wiringFromRef.current = cardIndex;
    setWiringFrom(cardIndex);
  }, []);

  useEffect(() => {
    if (wiringFrom === null) {
      setPendingLine(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const mx = e.clientX - canvasRect.left;
      const my = e.clientY - canvasRect.top;

      const wf = wiringFromRef.current;
      if (wf === null) return;
      const fromEl = nodeRefs.current[wf];
      if (!fromEl) return;

      const outputPort = fromEl.querySelector('[data-port="output"]');
      const inputPort = fromEl.querySelector('[data-port="input"]');
      const port = outputPort || inputPort;
      if (!port) return;
      const portPos = getPortCenter(port, canvasRect);

      const dx = mx - portPos.x;
      const handleLen = Math.min(Math.max(Math.abs(dx) * 0.5, 60), 200);
      setPendingLine(
        `M ${portPos.x} ${portPos.y} C ${portPos.x + handleLen} ${portPos.y}, ${mx - handleLen} ${my}, ${mx} ${my}`
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [wiringFrom, canvasRef, nodeRefs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClickCapture = (e: MouseEvent) => {
      const wf = wiringFromRef.current;
      if (wf === null) return;

      const target = e.target as HTMLElement;

      if (target.closest("[data-cancel-wiring]")) {
        wiringFromRef.current = null;
        setWiringFrom(null);
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      const cardEl = target.closest("[data-card-index]");

      if (cardEl) {
        const cardIndex = parseInt(cardEl.getAttribute("data-card-index")!, 10);
        if (cardIndex === wf) {
          wiringFromRef.current = null;
          setWiringFrom(null);
          e.stopPropagation();
          e.preventDefault();
          return;
        }

        const conns = connectionsRef.current;
        const exists = conns.some(
          (c) =>
            (c.from === wf && c.to === cardIndex) ||
            (c.from === cardIndex && c.to === wf)
        );
        if (!exists) {
          onConnectionsChangeRef.current([
            ...conns,
            { from: wf, to: cardIndex },
          ]);
        }
        wiringFromRef.current = null;
        setWiringFrom(null);
      } else {
        wiringFromRef.current = null;
        setWiringFrom(null);
      }

      e.stopPropagation();
      e.preventDefault();
    };

    canvas.addEventListener("click", handleClickCapture, true);
    return () => canvas.removeEventListener("click", handleClickCapture, true);
  }, [canvasRef]);

  const handleRemoveConnection = useCallback(
    (fromIndex: number, toIndex: number) => {
      onConnectionsChange(
        connectionsRef.current.filter(
          (c) => !(c.from === fromIndex && c.to === toIndex)
        )
      );
    },
    [onConnectionsChange]
  );

  return {
    wiringFrom,
    pendingLine,
    handlePortClick,
    handleRemoveConnection,
  };
}
