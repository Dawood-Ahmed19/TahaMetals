import { NextResponse } from "next/server";
import { quotationDb, inventoryDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { items, discount } = await req.json();

    // Validate each item against inventory
    for (const soldItem of items) {
      const { item, qty, weight } = soldItem;

      const inventoryItem: any = await inventoryDb.findOne({ name: item });

      if (!inventoryItem) {
        return NextResponse.json(
          {
            success: false,
            error: `❌ No item available with the name "${item}".`,
          },
          { status: 400 }
        );
      }

      if (Number(weight) !== Number(inventoryItem.weight)) {
        return NextResponse.json(
          {
            success: false,
            error: `❌ Weight mismatch for "${item}". Available: ${inventoryItem.weight}, Entered: ${weight}`,
          },
          { status: 400 }
        );
      }

      if (Number(qty) > Number(inventoryItem.quantity)) {
        return NextResponse.json(
          {
            success: false,
            error: `❌ Not enough stock for "${item}". Available: ${inventoryItem.quantity}, Requested: ${qty}`,
          },
          { status: 400 }
        );
      }
    }

    // Create quotation
    const newQuotation = await quotationDb.insert({
      items,
      discount,
      amount:
        items.reduce((sum: number, i: any) => sum + i.qty * i.rate, 0) -
        discount, // ✅ include rate
      date: new Date().toISOString(),
    });

    // Update inventory
    for (const soldItem of items) {
      const { item, qty } = soldItem;
      const inventoryItem: any = await inventoryDb.findOne({ name: item });

      if (inventoryItem) {
        const newQty = (inventoryItem.quantity || 0) - Number(qty);

        await inventoryDb.update(
          { _id: inventoryItem._id },
          { $set: { quantity: newQty } }
        );
      }
    }

    return NextResponse.json({ success: true, quotation: newQuotation });
  } catch (err: any) {
    console.error("Error saving quotation:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save quotation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quotations = await quotationDb.find({}).sort({ date: -1 }).limit(10);
    return NextResponse.json({ success: true, quotations });
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return NextResponse.json(
      { success: false, quotations: [] },
      { status: 500 }
    );
  }
}
