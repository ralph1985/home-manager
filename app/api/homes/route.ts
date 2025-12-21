import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const homes = await prisma.home.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: homes });
  } catch (error) {
    console.error("Failed to list homes.", error);
    return NextResponse.json({ error: "Failed to list homes." }, { status: 500 });
  }
}
