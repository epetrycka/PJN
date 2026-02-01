import React, { useMemo, useState, useRef, useEffect } from "react";
import type { CoreNode, CoreEdge } from "../../../commons/types";

type CoreGraphProps = {
  nodes: CoreNode[];
  edges: CoreEdge[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

export default function CoreGraph({ nodes, edges, selectedId, onSelect }: CoreGraphProps) {
  const [scale, setScale] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const maxConn = useMemo(() => Math.max(...nodes.map((n) => n.connection_weight)), [nodes]);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const n = nodes.length;
    const radius = 380;
    nodes.forEach((node, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      map.set(node.id, { x, y });
    });
    return map;
  }, [nodes]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.2, Math.min(5, s * delta)));
  };

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
    // don't start pan when interacting with nodes (circle elements)
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

  return (
    <div className="flex flex-col items-stretch h-full">
        <div className="flex gap-2 mb-2">
          <button className="btn btn-sm" onClick={() => setScale((s) => Math.min(5, s * 1.2))}>+</button>
          <button className="btn btn-sm" onClick={() => setScale((s) => Math.max(0.2, s * 0.8))}>-</button>
          <div className="text-sm text-base-content/80 ml-2">Zoom: {scale.toFixed(2)}x</div>
        </div>
      <div className="border rounded-lg flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          viewBox="-500 -500 1000 1000"
          className="w-full h-[640px] bg-base-200"
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{ cursor: dragging.current ? "grabbing" : "grab" }}>
            {/* edges */}
            <g>
              {edges.map((edge, i) => {
                const a = positions.get(edge.source);
                const b = positions.get(edge.target);
                if (!a || !b) return null;
                const isSel = selectedId && (edge.source === selectedId || edge.target === selectedId);
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={isSel ? "#2563eb" : "#9ca3af"}
                    strokeWidth={isSel ? 1.6 : 0.6}
                    opacity={isSel ? 0.95 : 0.35}
                  />
                );
              })}
            </g>

            {/* nodes */}
            {nodes.map((node) => {
              const pos = positions.get(node.id)!;
              const rBase = 3 + (node.connection_weight / maxConn) * 8;
              const isSelected = selectedId === node.id;
              const isNeighbor = selectedId && edges.some((e) => (e.source === selectedId && e.target === node.id) || (e.target === selectedId && e.source === node.id));
              const r = isSelected ? rBase * 1.6 : rBase;
              const fill = isSelected ? "#1e3a8a" : isNeighbor ? "#60a5fa" : "#2563eb";
              const stroke = isSelected ? "#1e40af" : isNeighbor ? "#1e3a8a" : "#1e40af";
              const strokeW = isSelected ? 1.2 : 0.6;
              return (
                <g key={node.id} transform={`translate(${pos.x},${pos.y})`}>
                  <circle
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    style={{ cursor: "pointer" }}
                    onClick={(ev) => { ev.stopPropagation(); onSelect(node.id); }}
                    onPointerDown={(ev) => ev.stopPropagation()}
                  />
                  <text
                    x={r + 6}
                    y={4}
                    fontSize={10}
                    fill="#0f172a"
                    style={{ pointerEvents: "none" }}
                  >
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
