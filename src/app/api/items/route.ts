import { inventoryDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await inventoryDb.find({});
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

function normalizeItem(item: any) {
  const name = (item.name || "").trim().toLowerCase();
  const size = String(item.size ?? "")
    .trim()
    .toLowerCase();
  const guage = String(item.guage ?? "")
    .trim()
    .toLowerCase();
  const pipeType = String(item.pipeType ?? "")
    .trim()
    .toLowerCase();
  const type = String(item.type ?? "")
    .trim()
    .toLowerCase();

  let uniqueKey: string;

  if (type === "pipe") {
    // Include pipe NAME/code (p001, p002) + specs
    uniqueKey = `${name}_${size}_${guage}_${pipeType}`;
  } else {
    // For non-pipe, specs are enough
    uniqueKey = `${name}_${size}_${guage}_${pipeType}`;
  }

  return {
    ...item,
    name,
    size,
    guage,
    pipeType,
    type,
    uniqueKey,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const normalized = normalizeItem(body);

    // 1️⃣ First check if the item already exists
    const existingItem = await inventoryDb.findOne({
      uniqueKey: normalized.uniqueKey,
    });

    if (existingItem) {
      // ✅ Item exists → only increment qty, don't change name/index
      await inventoryDb.update(
        { _id: existingItem._id },
        {
          $inc: { quantity: Number(normalized.quantity ?? 0) },
          $set: { date: new Date().toISOString() },
        },
        { returnUpdatedDocs: true }
      );

      return NextResponse.json(
        { success: true, item: existingItem },
        { status: 200 }
      );
    }

    // 2️⃣ New item → generate new pipe code if type is pipe
    let itemName = normalized.name;

    if (!itemName && normalized.type?.toLowerCase() === "pipe") {
      const pipes = (await inventoryDb
        .find({ type: "pipe" })
        .sort({ index: -1 })
        .limit(1)) as any[];

      const lastPipe = pipes.length > 0 ? pipes[0] : null;
      const nextNumber = lastPipe?.index ? lastPipe.index + 1 : 1;

      itemName = `p${String(nextNumber).padStart(3, "0")}`;
      normalized.name = itemName;
      normalized.index = nextNumber;
    }

    // Insert brand new item
    const newItem = await inventoryDb.insert({
      ...normalized,
      name: normalized.name,
      index: normalized.index ?? 1,
      quantity: Number(normalized.quantity ?? 0),
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 200 });
  } catch (err: any) {
    console.error("Error saving item:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save item" },
      { status: 500 }
    );
  }
}
