"use client";

import { useCallback, useEffect, useState } from "react";

interface PhotoModalProps {
  photo: {
    id: string;
    title: string;
    description?: string | null;
    filename: string;
    tags: string[];
    createdAt: string;
    date?: string | null;
    people?: string[];
    location?: string | null;
  };
  onClose: () => void;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const WATERMARK_SITE = "@lyxmemo.github.io/photos";

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [saving, setSaving] = useState(false);

  // Watermark: only short metadata + site, no description
  const watermarkLines: string[] = [];
  if (photo.date) watermarkLines.push(photo.date);
  if (photo.location) watermarkLines.push(photo.location);
  if (photo.people && photo.people.length > 0) watermarkLines.push(photo.people.join("、"));
  watermarkLines.push(WATERMARK_SITE);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `${basePath}/images/${photo.filename}`;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      // Font sizing relative to image
      const fontSize = Math.max(14, Math.round(canvas.width * 0.018));
      const lineHeight = fontSize * 1.5;
      const padding = Math.round(canvas.width * 0.025);

      ctx.font = `${fontSize}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      // Measure max width for background
      let maxWidth = 0;
      for (const line of watermarkLines) {
        const m = ctx.measureText(line);
        if (m.width > maxWidth) maxWidth = m.width;
      }

      // Draw semi-transparent background
      const bgPadX = padding * 0.8;
      const bgPadY = padding * 0.5;
      const bgWidth = maxWidth + bgPadX * 2;
      const bgHeight = watermarkLines.length * lineHeight + bgPadY * 2;
      const bgX = canvas.width - padding - bgWidth;
      const bgY = canvas.height - padding - bgHeight;

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      const radius = fontSize * 0.4;
      ctx.beginPath();
      ctx.moveTo(bgX + radius, bgY);
      ctx.lineTo(bgX + bgWidth - radius, bgY);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
      ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
      ctx.lineTo(bgX + radius, bgY + bgHeight);
      ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
      ctx.lineTo(bgX, bgY + radius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
      ctx.closePath();
      ctx.fill();

      // Draw text lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      const textX = canvas.width - padding - bgPadX;
      const textStartY = bgY + bgPadY + lineHeight * 0.75;

      for (let i = 0; i < watermarkLines.length; i++) {
        if (i === watermarkLines.length - 1) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.font = `${Math.round(fontSize * 0.85)}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
        }
        ctx.fillText(watermarkLines[i], textX, textStartY + i * lineHeight);
      }

      // Download
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${photo.title || "photo"}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      const a = document.createElement("a");
      a.href = `${basePath}/images/${photo.filename}`;
      a.download = photo.filename;
      a.click();
    } finally {
      setSaving(false);
    }
  }, [photo, watermarkLines]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="modal-content relative w-full max-w-4xl overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top buttons */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 items-center gap-1.5 rounded-full bg-black/40 px-3 text-xs font-medium text-white/90 transition hover:bg-black/60 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 transition hover:bg-black/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Image with watermark overlay */}
        <div className="relative flex items-center justify-center bg-black">
          <img
            src={`${basePath}/images/${photo.filename}`}
            alt={photo.title}
            className="max-h-[85vh] w-full object-contain"
          />
          {/* Watermark overlay — always visible, screenshot-proof */}
          <div className="pointer-events-none absolute bottom-0 right-0 p-2.5 sm:p-4">
            <div className="rounded-lg bg-black/30 px-2.5 py-1.5 text-right backdrop-blur-[2px] sm:px-3 sm:py-2">
              {watermarkLines.map((line, i) => (
                <p
                  key={i}
                  className={`leading-snug ${
                    i === watermarkLines.length - 1
                      ? "text-[10px] text-white/50 sm:text-xs"
                      : "text-[10px] text-white/85 sm:text-xs"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Description below image */}
        {photo.description && (
          <div className="bg-zinc-900 px-4 py-3 sm:px-5">
            <p className="text-sm leading-relaxed text-zinc-300">{photo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
