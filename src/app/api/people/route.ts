import { NextResponse } from "next/server";
import { getAllPeople } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getAllPeople());
}
