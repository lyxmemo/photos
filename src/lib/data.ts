import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "photos.json");

export interface Photo {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PhotoData {
  photos: Photo[];
}

function readData(): PhotoData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { photos: [] };
  }
}

function writeData(data: PhotoData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n");
}

export function getPhotos(): Photo[] {
  return readData().photos;
}

export function getPhoto(id: string): Photo | undefined {
  return readData().photos.find((p) => p.id === id);
}

export function addPhoto(
  input: Omit<Photo, "id" | "createdAt" | "updatedAt">
): Photo {
  const data = readData();
  const now = new Date().toISOString();
  const photo: Photo = {
    id: randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  data.photos.unshift(photo);
  writeData(data);
  return photo;
}

export function updatePhoto(
  id: string,
  updates: Partial<Pick<Photo, "title" | "description" | "tags">>
): Photo | null {
  const data = readData();
  const index = data.photos.findIndex((p) => p.id === id);
  if (index === -1) return null;

  data.photos[index] = {
    ...data.photos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return data.photos[index];
}

export function deletePhoto(id: string): Photo | null {
  const data = readData();
  const index = data.photos.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const [deleted] = data.photos.splice(index, 1);
  writeData(data);
  return deleted;
}

export function getAllTags(): { name: string; count: number }[] {
  const photos = getPhotos();
  const tagCounts = new Map<string, number>();
  for (const photo of photos) {
    for (const tag of photo.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
