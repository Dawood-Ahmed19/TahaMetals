import { inventoryDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await inventoryDb.find({});

    return new Response(JSON.stringify({ success: true, items }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch items" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function normalizeItem(item: any) {
  const name = item.name.trim().toLowerCase();
  const size = String(item.size ?? "").trim();
  const guage = String(item.guage ?? "").trim();

  return {
    ...item,
    name,
    size,
    guage,
    uniqueKey: `${name}_${size}_${guage}`,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const normalized = normalizeItem(body);

    const updated = await inventoryDb.update(
      { uniqueKey: normalized.uniqueKey },
      {
        $set: {
          name: normalized.name,
          size: normalized.size,
          guage: normalized.guage,
          type: normalized.type,
          pipeType: normalized.pipeType,
          weight: normalized.weight,
          price: normalized.price,
          height: normalized.height,
          gote: normalized.gote,
          date: normalized.date,
          uniqueKey: normalized.uniqueKey,
        },
        $inc: { quantity: Number(normalized.quantity ?? 0) },
      },
      { upsert: true, returnUpdatedDocs: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Error saving item:", err);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}
