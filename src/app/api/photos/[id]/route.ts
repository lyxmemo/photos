import { NextRequest, NextResponse } from "next/server";
import { getPhoto, updatePhoto, deletePhoto } from "@/lib/data";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = getPhoto(id);

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(photo);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, description, tags, date, people, location } = body;

  const photo = updatePhoto(id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(tags !== undefined && { tags }),
    ...(date !== undefined && { date }),
    ...(people !== undefined && { people }),
    ...(location !== undefined && { location }),
  });

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(photo);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = deletePhoto(id);

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete the image file
  try {
    const filePath = path.join(process.cwd(), "public", "images", photo.filename);
    await unlink(filePath);
  } catch {
    // File may not exist, continue
  }

  return NextResponse.json({ success: true });
}
