"use client";

import { useMemo, useState } from "react";
import { LOCATION_COORDS } from "@/lib/viewData";
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

// Map projection: equirectangular
// Viewport covers East Asia + Southeast Asia + a bit of Europe for Paris
const MAP_BOUNDS = { minLng: -5, maxLng: 140, minLat: 10, maxLat: 55 };
const SVG_W = 800;
const SVG_H = 400;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * SVG_W;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * SVG_H;
  return { x, y };
}

export default function MapView({ photos }: { photos: Photo[] }) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const locationGroups = useMemo(() => {
    const groups = new Map<string, Photo[]>();
    for (const photo of photos) {
      if (photo.location) {
        const existing = groups.get(photo.location) || [];
        existing.push(photo);
        groups.set(photo.location, existing);
      }
    }
    return groups;
  }, [photos]);

  const pins = useMemo(() => {
    return Array.from(locationGroups.entries())
      .map(([loc, locPhotos]) => {
        const coords = LOCATION_COORDS[loc];
        if (!coords) return null;
        const { x, y } = project(coords.lat, coords.lng);
        return { location: loc, label: coords.label, x, y, photos: locPhotos, count: locPhotos.length };
      })
      .filter(Boolean) as {
      location: string; label: string; x: number; y: number; photos: Photo[]; count: number;
    }[];
  }, [locationGroups]);

  const selectedPhotos = selectedLocation ? locationGroups.get(selectedLocation) || [] : [];

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ minHeight: 280 }}
        >
          {/* Grid lines */}
          {[30, 60, 90, 120].map((lng) => {
            const { x } = project(0, lng);
            return (
              <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={SVG_H}
                stroke="currentColor" strokeWidth={0.5} className="text-zinc-200 dark:text-zinc-700" strokeDasharray="4 4" />
            );
          })}
          {[20, 30, 40, 50].map((lat) => {
            const { y } = project(lat, 0);
            return (
              <line key={`lat${lat}`} x1={0} y1={y} x2={SVG_W} y2={y}
                stroke="currentColor" strokeWidth={0.5} className="text-zinc-200 dark:text-zinc-700" strokeDasharray="4 4" />
            );
          })}

          {/* Simplified China outline (approximate) */}
          <path
            d={chinaOutline()}
            fill="rgba(251 191 36 / 0.15)"
            stroke="rgba(251 191 36 / 0.4)"
            strokeWidth={1}
          />

          {/* Connection lines between pins */}
          {pins.map((pin, i) =>
            pins.slice(i + 1).map((pin2) => (
              <line
                key={`${pin.location}-${pin2.location}`}
                x1={pin.x} y1={pin.y} x2={pin2.x} y2={pin2.y}
                stroke="currentColor" strokeWidth={0.5} strokeDasharray="3 3"
                className="text-zinc-300 dark:text-zinc-700"
              />
            ))
          )}

          {/* Location pins */}
          {pins.map((pin) => {
            const isSelected = selectedLocation === pin.location;
            const r = Math.max(8, Math.min(16, 6 + pin.count * 1.5));
            return (
              <g
                key={pin.location}
                className="cursor-pointer"
                onClick={() => setSelectedLocation(isSelected ? null : pin.location)}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle cx={pin.x} cy={pin.y} r={r + 6} fill="none"
                    stroke="rgb(239 68 68)" strokeWidth={2} opacity={0.4}>
                    <animate attributeName="r" from={r + 4} to={r + 14} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from={0.5} to={0} dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Pin circle */}
                <circle
                  cx={pin.x} cy={pin.y} r={r}
                  fill={isSelected ? "rgb(239 68 68)" : "rgb(59 130 246)"}
                  stroke="white" strokeWidth={2}
                  className="transition-all duration-200 hover:brightness-110"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                />
                {/* Count */}
                <text x={pin.x} y={pin.y} textAnchor="middle" dominantBaseline="central"
                  fill="white" fontSize={r > 10 ? 10 : 8} fontWeight="bold">
                  {pin.count}
                </text>
                {/* Label */}
                <text x={pin.x} y={pin.y + r + 14} textAnchor="middle"
                  fill="currentColor" fontSize={11} fontWeight="600"
                  className="text-zinc-700 dark:text-zinc-300">
                  {pin.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Photo grid for selected location */}
      {selectedLocation && selectedPhotos.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {LOCATION_COORDS[selectedLocation]?.label || selectedLocation}
            <span className="ml-2 text-xs font-normal text-zinc-400">
              {selectedPhotos.length} photos
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {selectedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={`${basePath}/images/${photo.filename}`}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-1 px-0.5">
                  <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">{photo.title}</p>
                  <p className="text-[11px] text-zinc-400">{photo.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}

// Simplified China outline path for SVG
function chinaOutline(): string {
  // Approximate outline of China + nearby regions (simplified polygon)
  const points: [number, number][] = [
    [73.5, 39], [75, 37], [77, 35], [79, 32], [80, 29],
    [84, 28], [87, 28], [88, 27], [92, 27], [96, 28],
    [97, 24], [98, 22], [100, 21], [102, 22], [104, 22],
    [106, 22], [108, 21], [108, 18], [110, 18], [110, 20],
    [108, 22], [107, 23], [107, 25], [110, 26], [112, 26],
    [114, 23], [117, 23], [119, 25], [121, 28], [122, 30],
    [121, 31], [122, 34], [120, 36], [122, 37], [124, 40],
    [123, 42], [124, 43], [127, 42], [129, 43], [130, 43],
    [131, 45], [134, 48], [131, 49], [126, 52], [121, 53],
    [120, 51], [117, 48], [115, 48], [112, 45], [111, 44],
    [108, 42], [105, 42], [100, 40], [96, 43], [92, 45],
    [87, 49], [82, 47], [80, 44], [78, 42], [74, 40],
  ];
  const path = points.map(([lng, lat], i) => {
    const { x, y } = project(lat, lng);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return path + " Z";
}
