import { NextRequest, NextResponse } from "next/server";
import { getPhotos, addPhoto } from "@/lib/data";

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
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (tag) {
    photos = photos.filter((p) => p.tags.includes(tag));
  }

  photos.sort((a, b) => {
    if (sort === "oldest")
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "title") return a.title.localeCompare(b.title);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, filename, tags } = body;

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
  });

  return NextResponse.json(photo, { status: 201 });
}
