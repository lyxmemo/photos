"use client";

import { useEffect } from "react";

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

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="modal-content relative flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-zinc-900 sm:max-w-4xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 transition hover:bg-black/60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Image */}
        <div className="flex max-h-[60vh] items-center justify-center bg-zinc-100 dark:bg-zinc-800 sm:max-h-[70vh]">
          <img
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
