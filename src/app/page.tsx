"use client";

import { useCallback, useEffect, useState } from "react";
import PhotoCard from "@/components/PhotoCard";
import PhotoModal from "@/components/PhotoModal";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";

interface Tag {
  id: string;
  name: string;
  _count: { photos: number };
}

interface Photo {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  tags: { id: string; name: string }[];
  createdAt: string;
  user?: { username: string };
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTag) params.set("tag", selectedTag);
    params.set("sort", sort);

    const res = await fetch(`/api/photos?${params}`);
    const data = await res.json();
    setPhotos(data);
    setLoading(false);
  }, [search, selectedTag, sort]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags);
  }, []);

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
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      {tags.length > 0 && (
        <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      )}

      {loading ? (
        <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">Loading...</div>
      ) : photos.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
          No photos found. {search || selectedTag ? "Try adjusting your filters." : "Upload some photos to get started!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="cursor-pointer">
              <PhotoCard
                title={photo.title}
                filename={photo.filename}
                tags={photo.tags}
                createdAt={photo.createdAt}
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
