"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PhotoCard from "@/components/PhotoCard";
import PhotoModal from "@/components/PhotoModal";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";
import { parseDateForSort } from "@/lib/dateUtils";

interface Photo {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  tags: string[];
  date: string | null;
  people: string[];
  location: string | null;
  createdAt: string;
}

interface Tag {
  name: string;
  count: number;
}

interface GalleryProps {
  photos: Photo[];
  tags: Tag[];
}

const BATCH = 12;

export default function Gallery({ photos, tags }: GalleryProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sort, setSort] = useState("date_newest");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [displayCount, setDisplayCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredPhotos = useMemo(() => {
    let result = photos;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.people.some((person) => person.toLowerCase().includes(q)) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    return [...result].sort((a, b) => {
      if (sort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "date_newest") {
        const da = parseDateForSort(a.date);
        const db = parseDateForSort(b.date);
        return da === db ? 0 : da === Infinity ? 1 : db === Infinity ? -1 : db - da;
      }
      if (sort === "date_oldest") {
        const da = parseDateForSort(a.date);
        const db = parseDateForSort(b.date);
        return da === db ? 0 : da === Infinity ? 1 : db === Infinity ? -1 : da - db;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [photos, search, selectedTag, sort]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(BATCH);
  }, [search, selectedTag, sort]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + BATCH, filteredPhotos.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPhotos.length]);

  const visiblePhotos = filteredPhotos.slice(0, displayCount);
  const hasMore = displayCount < filteredPhotos.length;

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-700 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-500"
        >
          <option value="date_newest">Newest first</option>
          <option value="date_oldest">Oldest first</option>
          <option value="newest">Recently added</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {tags.length > 0 && (
        <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      )}

      {/* Masonry grid */}
      {filteredPhotos.length === 0 ? (
        <div className="py-24 text-center text-zinc-400 dark:text-zinc-500">
          No photos found.{" "}
          {search || selectedTag
            ? "Try adjusting your filters."
            : "Upload some photos to get started!"}
        </div>
      ) : (
        <>
          <div className="masonry">
            {visiblePhotos.map((photo) => (
              <div
                key={photo.id}
                className="masonry-item cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <PhotoCard
                  title={photo.title}
                  filename={photo.filename}
                  tags={photo.tags}
                  date={photo.date}
                  people={photo.people}
                  location={photo.location}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-px" />

          {hasMore && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
            </div>
          )}
        </>
      )}

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
