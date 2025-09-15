import { NextResponse } from "next/server";
import { inventoryDb } from "@/lib/db";

export async function GET() {
  try {
    const items = await inventoryDb.find({});
    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return NextResponse.json({ success: false, items: [] }, { status: 500 });
  }
}
