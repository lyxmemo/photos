"use client";

import { useCallback, useState } from "react";

interface PhotoCardProps {
  title: string;
  filename: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PhotoCard({ title, filename }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);

  // Use callback ref to catch already-cached images whose onLoad fired before React attached the handler
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="group overflow-hidden rounded-lg">
      <div className="relative overflow-hidden">
        <img
          ref={imgRef}
          src={`${basePath}/images/${filename}`}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`block w-full transition-all duration-500 group-hover:scale-[1.05] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        )}
      </div>
    </div>
  );
}
