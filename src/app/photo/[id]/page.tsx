"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Photo {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  tags: { id: string; name: string }[];
  createdAt: string;
  user?: { username: string };
}

export default function PhotoDetailPage() {
  const { id } = useParams();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/photos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPhoto(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Loading...</div>;
  }

  if (!photo) {
    return <div className="py-20 text-center text-zinc-500">Photo not found</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to gallery
      </Link>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={`/uploads/${photo.filename}`}
            alt={photo.title}
            fill
            className="object-contain"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{photo.title}</h1>

          {photo.description && (
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{photo.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
            {photo.user && <span>Uploaded by {photo.user.username}</span>}
          </div>

          {photo.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
