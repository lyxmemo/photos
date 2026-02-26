"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildNetworkData, type NetworkNode, type NetworkEdge } from "@/lib/viewData";
import PhotoModal from "@/components/PhotoModal";

interface Photo {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  tags: string[];
  date: string | null;
  people: string[];
  location: string | null;
  createdAt: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface SimNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function NetworkView({ photos }: { photos: Photo[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<NetworkEdge | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const isDarkRef = useRef(false);

  const network = useMemo(() => buildNetworkData(photos), [photos]);

  // Initialize simulation nodes
  useEffect(() => {
    const w = dimensions.w;
    const h = dimensions.h;
    const cx = w / 2;
    const cy = h / 2;
    nodesRef.current = network.nodes.map((n, i) => {
      const angle = (i / network.nodes.length) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.3;
      return {
        ...n,
        x: cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });
  }, [network.nodes, dimensions]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setDimensions({ w: width, h: Math.max(400, Math.min(600, width * 0.65)) });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Force simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let animId: number;
    let tick = 0;
    const maxTicks = 300;

    const nodeMap = new Map<string, SimNode>();

    function simulate() {
      const nodes = nodesRef.current;
      const w = dimensions.w;
      const h = dimensions.h;
      const cx = w / 2;
      const cy = h / 2;

      nodeMap.clear();
      for (const n of nodes) nodeMap.set(n.id, n);

      if (tick < maxTicks) {
        const alpha = 1 - tick / maxTicks;
        const strength = alpha * 0.3;

        // Center gravity
        for (const n of nodes) {
          n.vx += (cx - n.x) * 0.001 * alpha;
          n.vy += (cy - n.y) * 0.001 * alpha;
        }

        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (120 * 120) / (dist * dist) * strength;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }

        // Attraction along edges
        for (const edge of network.edges) {
          const a = nodeMap.get(edge.source);
          const b = nodeMap.get(edge.target);
          if (!a || !b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 120 + 30 / edge.photos.length;
          const force = (dist - targetDist) * 0.005 * strength;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }

        // Apply velocity with damping + boundary
        for (const n of nodes) {
          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
          // Keep within bounds
          const pad = 50;
          n.x = Math.max(pad, Math.min(w - pad, n.x));
          n.y = Math.max(pad, Math.min(h - pad, n.y));
        }

        tick++;
      }

      // Render
      isDarkRef.current = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = isDarkRef.current;
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      for (const edge of network.edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;

        const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
        const isSelectedEdge = selectedEdge &&
          ((selectedEdge.source === edge.source && selectedEdge.target === edge.target) ||
           (selectedEdge.source === edge.target && selectedEdge.target === edge.source));

        const thickness = Math.min(5, 1 + edge.photos.length * 0.6);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isSelectedEdge
          ? "rgb(239 68 68)"
          : isHighlighted
          ? (dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)")
          : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)");
        ctx.lineWidth = isHighlighted || isSelectedEdge ? thickness + 1 : thickness;
        ctx.stroke();

        // Edge label (photo count) — show on hover
        if (isHighlighted || isSelectedEdge) {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          ctx.font = "bold 10px system-ui";
          ctx.fillStyle = isSelectedEdge ? "rgb(239 68 68)" : (dark ? "#fff" : "#333");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${edge.photos.length}`, mx, my - 8);
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const isHovered = hoveredNode === n.id;
        const r = Math.max(18, 12 + n.photoCount * 2);

        // Glow for hovered
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
          ctx.fillStyle = dark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)";
          ctx.fill();
        }

        // Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHovered
          ? "rgb(59 130 246)"
          : (dark ? "rgb(63 63 70)" : "rgb(244 244 245)");
        ctx.fill();
        ctx.strokeStyle = isHovered
          ? "rgb(37 99 235)"
          : (dark ? "rgb(113 113 122)" : "rgb(212 212 216)");
        ctx.lineWidth = 2;
        ctx.stroke();

        // Name label
        ctx.font = `${isHovered ? "bold " : ""}12px system-ui`;
        ctx.fillStyle = isHovered
          ? "white"
          : (dark ? "rgb(212 212 216)" : "rgb(63 63 70)");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.name, n.x, n.y);
      }

      animId = requestAnimationFrame(simulate);
    }

    simulate();
    return () => cancelAnimationFrame(animId);
  }, [network, hoveredNode, selectedEdge, dimensions]);

  // Mouse interaction
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = dimensions.w / rect.width;
      const scaleY = dimensions.h / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      let found: string | null = null;
      for (const n of nodesRef.current) {
        const r = Math.max(18, 12 + n.photoCount * 2);
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy < r * r) {
          found = n.id;
          break;
        }
      }
      setHoveredNode(found);
      canvas.style.cursor = found ? "pointer" : "default";
    },
    [dimensions]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = dimensions.w / rect.width;
      const scaleY = dimensions.h / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      const nodeMap = new Map<string, SimNode>();
      for (const n of nodesRef.current) nodeMap.set(n.id, n);

      // Check edges first (click on edge to see photos)
      for (const edge of network.edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;
        // Point-to-line distance
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len2 = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((mx - a.x) * dx + (my - a.y) * dy) / len2));
        const px = a.x + t * dx;
        const py = a.y + t * dy;
        const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
        if (dist < 10) {
          setSelectedEdge(edge);
          return;
        }
      }

      // Check nodes
      for (const n of nodesRef.current) {
        const r = Math.max(18, 12 + n.photoCount * 2);
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy < r * r) {
          // Show all photos of this person
          setSelectedEdge(null);
          setHoveredNode(n.id);
          return;
        }
      }

      setSelectedEdge(null);
    },
    [network, dimensions]
  );

  // Get photos for the selected edge or hovered node
  const detailPhotos = useMemo(() => {
    if (selectedEdge) {
      return selectedEdge.photos.map((ep) => photos.find((p) => p.id === ep.id)).filter(Boolean) as Photo[];
    }
    if (hoveredNode) {
      return photos.filter((p) => p.people.includes(hoveredNode));
    }
    return [];
  }, [selectedEdge, hoveredNode, photos]);

  const detailTitle = selectedEdge
    ? `${selectedEdge.source} & ${selectedEdge.target}`
    : hoveredNode || "";

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
          className="w-full"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={() => setHoveredNode(null)}
        />
      </div>

      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        点击连线查看共同照片 · 悬停姓名高亮关系
      </p>

      {/* Detail panel: photos for selected edge or person */}
      {detailPhotos.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {detailTitle}
            <span className="ml-2 text-xs font-normal text-zinc-400">
              {detailPhotos.length} 张照片
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {detailPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={`${basePath}/images/${photo.filename}`}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-1 px-0.5">
                  <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {photo.title}
                  </p>
                  <p className="text-[11px] text-zinc-400">{photo.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
