import { NextResponse } from "next/server";
import { getAllLocations } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getAllLocations());
}
