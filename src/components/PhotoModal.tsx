"use client";

import Image from "next/image";
import { useEffect } from "react";

interface PhotoModalProps {
  photo: {
    id: string;
    title: string;
    description?: string | null;
    filename: string;
    tags: string[];
    createdAt: string;
  };
  onClose: () => void;
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-5xl overflow-auto rounded-2xl bg-white dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="relative aspect-video w-full min-w-[300px] max-w-4xl bg-zinc-100 dark:bg-zinc-800 sm:min-w-[500px]">
          <Image
            src={`/images/${photo.filename}`}
            alt={photo.title}
            fill
            className="object-contain"
            sizes="90vw"
          />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{photo.title}</h2>
          {photo.description && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">{photo.description}</p>
          )}
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(photo.createdAt).toLocaleDateString()}
          </p>
          {photo.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
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
