import { NextRequest, NextResponse } from "next/server";
import { inventoryDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Missing type parameter" },
        { status: 400 }
      );
    }

    const count = await inventoryDb.count({ type });
    const nextNumber = count + 1;

    return NextResponse.json({ count, nextNumber });
  } catch (err) {
    console.error("Error counting items:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
