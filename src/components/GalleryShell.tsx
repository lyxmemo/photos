"use client";

import { useState } from "react";
import ViewSwitcher, { type ViewMode } from "@/components/ViewSwitcher";
import Gallery from "@/components/Gallery";
import TimelineView from "@/components/TimelineView";
import MapView from "@/components/MapView";
import NetworkView from "@/components/NetworkView";

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

export default function GalleryShell({ photos, tags }: { photos: Photo[]; tags: Tag[] }) {
  const [view, setView] = useState<ViewMode>("gallery");

  return (
    <div className="space-y-4">
      <ViewSwitcher current={view} onChange={setView} />

      {view === "gallery" && <Gallery photos={photos} tags={tags} />}
      {view === "timeline" && <TimelineView photos={photos} />}
      {view === "map" && <MapView photos={photos} />}
      {view === "network" && <NetworkView photos={photos} />}
    </div>
  );
}
