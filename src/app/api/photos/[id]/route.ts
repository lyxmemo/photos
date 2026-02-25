import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { tags: true, user: { select: { username: true } } },
  });

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(photo);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, description, tags } = body;

  const photo = await prisma.photo.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(tags !== undefined && {
        tags: {
          set: [],
          connectOrCreate: (tags as string[]).map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    },
    include: { tags: true },
  });

  return NextResponse.json(photo);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete the file
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", photo.filename);
    await unlink(filePath);
  } catch {
    // File may not exist, continue
  }

  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
