"use client";

import { useCallback, useMemo, useState } from "react";
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

export default function Gallery({ photos, tags }: GalleryProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Gallery</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-500 dark:text-zinc-400">Sort:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          >
            <option value="newest">Upload newest</option>
            <option value="oldest">Upload oldest</option>
            <option value="date_newest">Photo date (newest)</option>
            <option value="date_oldest">Photo date (oldest)</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      {tags.length > 0 && (
        <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      )}

      {filteredPhotos.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
          No photos found.{" "}
          {search || selectedTag
            ? "Try adjusting your filters."
            : "Upload some photos to get started!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="cursor-pointer"
            >
              <PhotoCard
                title={photo.title}
                filename={photo.filename}
                tags={photo.tags}
                createdAt={photo.createdAt}
                date={photo.date}
                people={photo.people}
                location={photo.location}
              />
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
