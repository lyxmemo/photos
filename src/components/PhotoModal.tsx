"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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

      // Build watermark lines
      const lines: string[] = [];
      if (photo.date) lines.push(photo.date);
      if (photo.location) lines.push(photo.location);
      if (photo.people && photo.people.length > 0) lines.push(photo.people.join("、"));
      if (photo.description) lines.push(photo.description);
      lines.push("@lyxmemo");

      // Font sizing relative to image
      const fontSize = Math.max(14, Math.round(canvas.width * 0.018));
      const lineHeight = fontSize * 1.5;
      const padding = Math.round(canvas.width * 0.025);

      ctx.font = `${fontSize}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      // Measure max width for background
      let maxWidth = 0;
      for (const line of lines) {
        const m = ctx.measureText(line);
        if (m.width > maxWidth) maxWidth = m.width;
      }

      // Draw semi-transparent background
      const bgPadX = padding * 0.8;
      const bgPadY = padding * 0.5;
      const bgWidth = maxWidth + bgPadX * 2;
      const bgHeight = lines.length * lineHeight + bgPadY * 2;
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

      for (let i = 0; i < lines.length; i++) {
        // Make @lyxmemo slightly dimmer
        if (i === lines.length - 1 && lines[i] === "@lyxmemo") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        }
        ctx.fillText(lines[i], textX, textStartY + i * lineHeight);
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
      // Fallback: direct download without watermark
      const a = document.createElement("a");
      a.href = `${basePath}/images/${photo.filename}`;
      a.download = photo.filename;
      a.click();
    } finally {
      setSaving(false);
    }
  }, [photo]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="modal-content relative flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-zinc-900 sm:max-w-4xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top buttons */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {/* Save button */}
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 transition hover:bg-black/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="flex max-h-[60vh] items-center justify-center bg-zinc-100 dark:bg-zinc-800 sm:max-h-[70vh]">
          <img
            ref={imgRef}
            src={`${basePath}/images/${photo.filename}`}
            alt={photo.title}
            className="max-h-[60vh] w-full object-contain sm:max-h-[70vh]"
          />
        </div>

        {/* Metadata */}
        <div className="overflow-y-auto p-5 sm:p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white sm:text-xl">
            {photo.title}
          </h2>

          {photo.description && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {photo.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {photo.date && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {photo.date}
              </span>
            )}
            {photo.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {photo.location}
              </span>
            )}
          </div>

          {photo.people && photo.people.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {photo.people.map((person) => (
                <span
                  key={person}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {person}
                </span>
              ))}
            </div>
          )}

          {photo.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
