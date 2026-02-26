"use client";

import { useState } from "react";

interface PhotoCardProps {
  title: string;
  filename: string;
  tags: string[];
  date?: string | null;
  people?: string[];
  location?: string | null;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PhotoCard({ title, filename, tags, date, people, location }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-zinc-900">
      {/* Image — native img for natural aspect ratio in masonry */}
      <div className="relative overflow-hidden">
        <img
          src={`${basePath}/images/${filename}`}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full transition-all duration-500 group-hover:scale-[1.03] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <h3 className="text-sm font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
          {title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {date && <span>{date}</span>}
          {date && location && <span>·</span>}
          {location && <span>{location}</span>}
        </div>
        {people && people.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
            {people.join(", ")}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
