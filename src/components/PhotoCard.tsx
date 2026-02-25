"use client";

import Image from "next/image";

interface PhotoCardProps {
  title: string;
  filename: string;
  tags: string[];
  createdAt: string;
  date?: string | null;
  people?: string[];
  location?: string | null;
}

export default function PhotoCard({ title, filename, tags, createdAt, date, people, location }: PhotoCardProps) {
  return (
    <div className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={`/images/${filename}`}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="p-3">
        <h3 className="truncate font-medium text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {date || new Date(createdAt).toLocaleDateString()}
        </p>
        {(location || (people && people.length > 0)) && (
          <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
            {[location, people && people.length > 0 ? people.join(", ") : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
