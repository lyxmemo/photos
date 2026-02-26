"use client";

import { useMemo, useState } from "react";
import PhotoModal from "@/components/PhotoModal";

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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function TimelineView({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Group photos by year, sorted chronologically
  const yearGroups = useMemo(() => {
    const withDate = photos.filter((p) => p.date);
    withDate.sort((a, b) => {
      const da = a.date!;
      const db = b.date!;
      return da.localeCompare(db);
    });

    const groups: { year: string; photos: Photo[] }[] = [];
    for (const photo of withDate) {
      const year = photo.date!.slice(0, 4);
      const last = groups[groups.length - 1];
      if (last && last.year === year) {
        last.photos.push(photo);
      } else {
        groups.push({ year, photos: [photo] });
      }
    }

    // Add undated photos at the end
    const undated = photos.filter((p) => !p.date);
    if (undated.length > 0) {
      groups.push({ year: "未知", photos: undated });
    }

    return groups;
  }, [photos]);

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 h-full w-px bg-zinc-200 dark:bg-zinc-800 sm:left-1/2" />

      {yearGroups.map((group, gi) => (
        <div key={group.year} className="relative">
          {/* Year marker */}
          <div className="sticky top-16 z-10 mb-4 flex items-center sm:justify-center">
            <div className="ml-2 rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-bold text-white shadow-lg dark:bg-white dark:text-zinc-900 sm:ml-0">
              {group.year}
            </div>
          </div>

          {/* Photos in this year */}
          <div className="space-y-6 pb-8">
            {group.photos.map((photo, pi) => {
              const isLeft = (gi + pi) % 2 === 0;
              return (
                <div
                  key={photo.id}
                  className={`relative flex items-start gap-4 pl-10 sm:pl-0 ${
                    isLeft ? "sm:flex-row-reverse sm:text-right" : ""
                  }`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-[22px] top-3 h-3 w-3 rounded-full border-2 border-zinc-400 bg-white dark:border-zinc-500 dark:bg-zinc-900 sm:left-1/2 sm:-ml-1.5" />

                  {/* Spacer for the other side */}
                  <div className="hidden w-1/2 sm:block" />

                  {/* Card */}
                  <div
                    className="w-full cursor-pointer sm:w-1/2"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md dark:bg-zinc-900">
                      <div className="relative overflow-hidden">
                        <img
                          src={`${basePath}/images/${photo.filename}`}
                          alt={photo.title}
                          loading="lazy"
                          className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className={`p-3 ${isLeft ? "sm:text-right" : ""}`}>
                        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {photo.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                          {isLeft && <span className="hidden sm:inline" />}
                          {photo.date && <span>{photo.date}</span>}
                          {photo.date && photo.location && <span>·</span>}
                          {photo.location && <span>{photo.location}</span>}
                        </div>
                        {photo.people.length > 0 && (
                          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                            {photo.people.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* End marker */}
      <div className="relative flex items-center sm:justify-center">
        <div className="ml-2 rounded-full bg-zinc-300 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 sm:ml-0">
          End
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
