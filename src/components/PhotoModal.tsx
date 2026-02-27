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

  // Info lines for the bar below image
  const infoItems: string[] = [];
  if (photo.date) infoItems.push(photo.date);
  if (photo.location) infoItems.push(photo.location);
  if (photo.people && photo.people.length > 0) infoItems.push(photo.people.join("、"));

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

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Font sizing relative to image width
      const fontSize = Math.max(14, Math.round(imgW * 0.018));
      const smallFontSize = Math.round(fontSize * 0.85);
      const padding = Math.round(imgW * 0.025);
      const lineHeight = fontSize * 1.6;
      const fontFamily = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

      // Build text lines for the bottom bar
      const lines: { text: string; small?: boolean }[] = [];
      // Meta line: date · location · people
      const metaParts: string[] = [];
      if (photo.date) metaParts.push(photo.date);
      if (photo.location) metaParts.push(photo.location);
      if (photo.people && photo.people.length > 0) metaParts.push(photo.people.join("、"));
      if (metaParts.length > 0) lines.push({ text: metaParts.join("  ·  ") });
      // Description (may be multi-line, wrap manually)
      if (photo.description) {
        const descLines = wrapText(photo.description, imgW - padding * 2, fontSize, fontFamily);
        for (const dl of descLines) lines.push({ text: dl });
      }
      // Site
      lines.push({ text: WATERMARK_SITE, small: true });

      // Calculate bar height
      const barPadY = padding * 0.7;
      let barHeight = barPadY * 2;
      for (const l of lines) {
        barHeight += l.small ? smallFontSize * 1.6 : lineHeight;
      }

      // Create canvas: image + bar
      const canvas = document.createElement("canvas");
      canvas.width = imgW;
      canvas.height = imgH + barHeight;
      const ctx = canvas.getContext("2d")!;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw bottom bar background
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, imgH, imgW, barHeight);

      // Draw text
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      let y = imgH + barPadY;
      for (const l of lines) {
        if (l.small) {
          ctx.font = `${smallFontSize}px ${fontFamily}`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          const currentLineH = smallFontSize * 1.6;
          ctx.fillText(l.text, padding, y);
          y += currentLineH;
        } else {
          ctx.font = `${fontSize}px ${fontFamily}`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillText(l.text, padding, y);
          y += lineHeight;
        }
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
  }, [photo]);

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

        {/* Image — clean, no overlay */}
        <div className="flex items-center justify-center bg-black">
          <img
            src={`${basePath}/images/${photo.filename}`}
            alt={photo.title}
            className="max-h-[75vh] w-full object-contain"
          />
        </div>

        {/* Info bar below image */}
        <div className="bg-zinc-900 px-4 py-3 sm:px-5">
          {infoItems.length > 0 && (
            <p className="text-xs leading-relaxed text-zinc-400 sm:text-sm">
              {infoItems.join("  ·  ")}
            </p>
          )}
          {photo.description && (
            <p className={`text-sm leading-relaxed text-zinc-300 ${infoItems.length > 0 ? "mt-1" : ""}`}>
              {photo.description}
            </p>
          )}
          <p className={`text-[10px] text-zinc-600 sm:text-xs ${photo.description || infoItems.length > 0 ? "mt-1.5" : ""}`}>
            {WATERMARK_SITE}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Wrap text into lines that fit within maxWidth on a canvas */
function wrapText(text: string, maxWidth: number, fontSize: number, fontFamily: string): string[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${fontSize}px ${fontFamily}`;

  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      result.push("");
      continue;
    }
    let line = "";
    for (const char of paragraph) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line.length > 0) {
        result.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) result.push(line);
  }
  return result;
}
