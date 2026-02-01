import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SemanticEdge, SemanticNode } from "../../../commons/types";

type BipartiteGraphProps = {
  leftNodes: SemanticNode[];
  rightNodes: SemanticNode[];
  edges: SemanticEdge[];
  leftLabel: string;
  rightLabel: string;
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

type Position = { x: number; y: number };

export default function BipartiteGraph({
  leftNodes,
  rightNodes,
  edges,
  leftLabel,
  rightLabel,
  selectedId,
  onSelect,
}: BipartiteGraphProps) {
  const [scale, setScale] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const sortedLeft = useMemo(
    () => [...leftNodes].sort((a, b) => b.frequency - a.frequency),
    [leftNodes]
  );
  const sortedRight = useMemo(
    () => [...rightNodes].sort((a, b) => b.frequency - a.frequency),
    [rightNodes]
  );

  const leftMax = useMemo(
    () => Math.max(1, ...sortedLeft.map((n) => n.frequency)),
    [sortedLeft]
  );
  const rightMax = useMemo(
    () => Math.max(1, ...sortedRight.map((n) => n.frequency)),
    [sortedRight]
  );

  const positions = useMemo(() => {
    const map = new Map<string, Position>();
    const leftX = -320;
    const rightX = 320;
    const top = -380;
    const bottom = 380;
    const leftGap = sortedLeft.length > 1 ? (bottom - top) / (sortedLeft.length - 1) : 0;
    const rightGap = sortedRight.length > 1 ? (bottom - top) / (sortedRight.length - 1) : 0;

    sortedLeft.forEach((node, index) => {
      map.set(node.id, { x: leftX, y: top + index * leftGap });
    });
    sortedRight.forEach((node, index) => {
      map.set(node.id, { x: rightX, y: top + index * rightGap });
    });
    return map;
  }, [sortedLeft, sortedRight]);

  const neighborIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === selectedId) set.add(edge.target);
      if (edge.target === selectedId) set.add(edge.source);
    });
    return set;
  }, [edges, selectedId]);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.2, Math.min(5, s * delta)));
  }, []);

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: clientX, y: clientY };
    const inv = ctm.inverse();
    const res = pt.matrixTransform(inv);
    return { x: res.x, y: res.y };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element | null;
    if (target && target.tagName.toLowerCase() === "circle") return;
    const p = clientToSvg(e.clientX, e.clientY);
    lastPoint.current = p;
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !lastPoint.current) return;
    const p = clientToSvg(e.clientX, e.clientY);
    const dx = p.x - lastPoint.current.x;
    const dy = p.y - lastPoint.current.y;
    lastPoint.current = p;
    setPan((s) => ({ x: s.x + dx, y: s.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    lastPoint.current = null;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const prevent = (e: Event) => e.preventDefault();
    svg.addEventListener("touchmove", prevent, { passive: false });
    return () => svg.removeEventListener("touchmove", prevent as any);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <div className="flex flex-col items-stretch h-full">
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <button className="btn btn-sm" onClick={() => setScale((s) => Math.min(5, s * 1.2))}>
          +
        </button>
        <button className="btn btn-sm" onClick={() => setScale((s) => Math.max(0.2, s * 0.8))}>
          -
        </button>
        <div className="text-sm text-base-content/80 ml-2">Zoom: {scale.toFixed(2)}x</div>
        <div className="ml-auto flex items-center gap-3 text-xs text-base-content/70">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            {leftLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
            {rightLabel}
          </span>
        </div>
      </div>
      <div className="border rounded-lg flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          viewBox="-500 -450 1000 900"
          className="w-full h-[520px] bg-base-200"
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{ cursor: dragging.current ? "grabbing" : "grab" }}>
            <g>
              {edges.map((edge, i) => {
                const a = positions.get(edge.source);
                const b = positions.get(edge.target);
                if (!a || !b) return null;
                const isSel = selectedId && (edge.source === selectedId || edge.target === selectedId);
                return (
                  <line
                    key={`${edge.source}-${edge.target}-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={isSel ? "#0f172a" : "#94a3b8"}
                    strokeWidth={isSel ? 1.6 : 0.5}
                    opacity={isSel ? 0.9 : 0.3}
                  />
                );
              })}
            </g>

            {sortedLeft.map((node) => {
              const pos = positions.get(node.id)!;
              const rBase = 3 + (node.frequency / leftMax) * 7;
              const isSelected = selectedId === node.id;
              const isNeighbor = neighborIds.has(node.id);
              const r = isSelected ? rBase * 1.6 : rBase;
              const fill = isSelected ? "#c2410c" : isNeighbor ? "#fb923c" : "#f97316";
              const stroke = isSelected ? "#9a3412" : "#c2410c";
              return (
                <g key={node.id} transform={`translate(${pos.x},${pos.y})`}>
                  <circle
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 1.2 : 0.6}
                    style={{ cursor: "pointer" }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelect(node.id);
                    }}
                    onPointerDown={(ev) => ev.stopPropagation()}
                  />
                  <text x={r + 6} y={4} fontSize={10} fill="#0f172a" style={{ pointerEvents: "none" }}>
                    {node.id}
                  </text>
                </g>
              );
            })}

            {sortedRight.map((node) => {
              const pos = positions.get(node.id)!;
              const rBase = 3 + (node.frequency / rightMax) * 7;
              const isSelected = selectedId === node.id;
              const isNeighbor = neighborIds.has(node.id);
              const r = isSelected ? rBase * 1.6 : rBase;
              const fill = isSelected ? "#0369a1" : isNeighbor ? "#38bdf8" : "#0ea5e9";
              const stroke = isSelected ? "#075985" : "#0f172a";
              return (
                <g key={node.id} transform={`translate(${pos.x},${pos.y})`}>
                  <circle
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 1.2 : 0.6}
                    style={{ cursor: "pointer" }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelect(node.id);
                    }}
                    onPointerDown={(ev) => ev.stopPropagation()}
                  />
                  <text x={-r - 6} y={4} fontSize={10} fill="#0f172a" textAnchor="end" style={{ pointerEvents: "none" }}>
                    {node.id}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
