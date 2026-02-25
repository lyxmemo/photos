import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/data";

export async function GET() {
  const tags = getAllTags();
  return NextResponse.json(tags);
}
