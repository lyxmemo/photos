"use client";

import { useState } from "react";

interface PhotoCardProps {
  title: string;
  filename: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PhotoCard({ title, filename }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group overflow-hidden rounded-lg">
      <div className="relative overflow-hidden">
        <img
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
