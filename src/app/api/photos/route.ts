import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const sort = searchParams.get("sort") || "newest";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  if (tag) {
    where.tags = { some: { name: tag } };
  }

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : sort === "title"
        ? { title: "asc" as const }
        : { createdAt: "desc" as const };

  const photos = await prisma.photo.findMany({
    where,
    include: { tags: true, user: { select: { username: true } } },
    orderBy,
  });

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, filename, tags } = body;

  if (!title || !filename) {
    return NextResponse.json(
      { error: "Title and filename are required" },
      { status: 400 }
    );
  }

  const photo = await prisma.photo.create({
    data: {
      title,
      description: description || null,
      filename,
      userId: session.user.id,
      tags: {
        connectOrCreate: (tags as string[] || []).map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  });

  return NextResponse.json(photo, { status: 201 });
}
