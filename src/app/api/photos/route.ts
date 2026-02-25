import { NextRequest, NextResponse } from "next/server";
import { getPhotos, addPhoto, parseDateForSort } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const sort = searchParams.get("sort") || "newest";

  let photos = getPhotos();

  if (search) {
    const q = search.toLowerCase();
    photos = photos.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.people.some((person) => person.toLowerCase().includes(q)) ||
        p.location?.toLowerCase().includes(q)
    );
  }

  if (tag) {
    photos = photos.filter((p) => p.tags.includes(tag));
  }

  photos.sort((a, b) => {
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

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, filename, tags, date, people, location } = body;

  if (!title || !filename) {
    return NextResponse.json(
      { error: "Title and filename are required" },
      { status: 400 }
    );
  }

  const photo = addPhoto({
    title,
    description: description || null,
    filename,
    tags: tags || [],
    date: date || null,
    people: people || [],
    location: location || null,
  });

  return NextResponse.json(photo, { status: 201 });
}
