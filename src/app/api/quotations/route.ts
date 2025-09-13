import { NextResponse } from "next/server";
import { quotationDb, inventoryDb } from "@/lib/db";

// ================== POST (Create Quotation) ==================
export async function POST(req: Request) {
  try {
    const { items, discount } = await req.json();

    // Validate against inventory
    for (const soldItem of items) {
      const { item, qty, weight } = soldItem;

      const inventoryItem: any = await new Promise((resolve, reject) => {
        (inventoryDb as any).findOne({ name: item }, (err: any, doc: any) => {
          if (err) reject(err);
          else resolve(doc);
        });
      });

      if (!inventoryItem) {
        throw new Error(`No item available with the name "${item}"`);
      }

      if (Number(weight) !== Number(inventoryItem.weight)) {
        throw new Error(
          `Weight mismatch for "${item}". Available: ${inventoryItem.weight}, Entered: ${weight}`
        );
      }

      if (Number(qty) > Number(inventoryItem.quantity)) {
        throw new Error(
          `Not enough stock for "${item}". Available: ${inventoryItem.quantity}, Requested: ${qty}`
        );
      }
    }

    // Save quotation (NeDB insert)
    const newQuotation: any = await new Promise((resolve, reject) => {
      (quotationDb as any).insert(
        {
          items,
          discount,
          amount:
            items.reduce((acc: number, i: any) => acc + i.qty * i.weight, 0) -
            discount,
          date: new Date(),
        },
        (err: any, doc: any) => {
          if (err) reject(err);
          else resolve(doc);
        }
      );
    });

    // Update inventory quantities
    for (const soldItem of items) {
      await new Promise((resolve, reject) => {
        (inventoryDb as any).update(
          { name: soldItem.item },
          { $inc: { quantity: -soldItem.qty } },
          (err: any, numUpdated: number) => {
            if (err) reject(err);
            else resolve(numUpdated);
          }
        );
      });
    }

    return NextResponse.json({
      success: true,
      message: "Quotation saved successfully",
      quotation: newQuotation,
    });
  } catch (err: any) {
    console.error("❌ Error saving quotation:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Error saving quotation" },
      { status: 400 }
    );
  }
}

// ================== GET (Fetch Quotations for Dashboard) ==================
export async function GET() {
  try {
    const quotations: any[] = await new Promise((resolve, reject) => {
      (quotationDb as any)
        .find({})
        .sort({ date: -1 })
        .limit(10)
        .exec((err: any, docs: any[]) => {
          if (err) reject(err);
          else resolve(docs);
        });
    });

    return NextResponse.json({ success: true, quotations });
  } catch (err: any) {
    console.error("❌ Error fetching quotations:", err.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}
