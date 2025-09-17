import { NextResponse } from "next/server";
import { quotationDb, inventoryDb } from "@/lib/db";

// Shared types
interface Payment {
  amount: number;
  date: string;
}

interface Quotation {
  _id?: string;
  quotationId: string;
  items: any[];
  discount: number;
  total: number;
  grandTotal: number;
  payments: Payment[];
  amount: number; // duplicate of grandTotal for compatibility
  date: string;
  totalReceived?: number;
  balance?: number;
}

export async function POST(req: Request) {
  try {
    const { items, discount, total, grandTotal, payments } = await req.json();

    // --- Validate Inventory Before Insert --- //
    for (const soldItem of items) {
      const { item, qty } = soldItem;

      // IMPORTANT ⚡ item must match inventory field (e.g. "name")
      const inventoryItem: any = await inventoryDb.findOne({ name: item });

      if (!inventoryItem) {
        return NextResponse.json(
          { success: false, error: `❌ No inventory found for "${item}".` },
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

    // --- Generate Quotation --- //
    const count = await quotationDb.count({});
    const quotationId = `QTN-${String(count + 1).padStart(4, "0")}`;

    const safePayments: Payment[] = Array.isArray(payments) ? payments : [];

    const inserted = await quotationDb.insert({
      quotationId,
      items,
      discount,
      total,
      grandTotal,
      payments: safePayments,
      amount: grandTotal,
      date: new Date().toISOString(),
    });

    // --- Update Inventory Stock --- //
    for (const soldItem of items) {
      const { item, qty } = soldItem;

      const inventoryItem: any = await inventoryDb.findOne({ name: item });

      if (inventoryItem) {
        // atomic decrement
        const newQty = (inventoryItem.quantity || 0) - Number(qty);

        await inventoryDb.update(
          { _id: inventoryItem._id },
          { $set: { quantity: newQty } }
        );
      }
    }

    // --- Normalize Before Returning --- //
    const totalReceived = safePayments.reduce((s, p) => s + p.amount, 0);
    const balance = grandTotal - totalReceived;

    return NextResponse.json({
      success: true,
      quotation: {
        ...inserted,
        payments: safePayments,
        totalReceived,
        balance,
      },
    });
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
    let rawDocs: any[] = await quotationDb
      .find({})
      .sort({ date: -1 })
      .limit(10);

    const count = await quotationDb.count({});

    // Normalize into our strict Quotation type
    const quotations: Quotation[] = rawDocs.map((q: any) => {
      const payments: Payment[] = Array.isArray(q.payments)
        ? q.payments
        : q.received
        ? [{ amount: q.received, date: q.date }]
        : [];

      const totalReceived = payments.reduce(
        (s: number, p: Payment) => s + p.amount,
        0
      );
      const balance = q.grandTotal
        ? q.grandTotal - totalReceived
        : q.amount - totalReceived;

      return {
        ...q,
        payments,
        totalReceived,
        balance,
      } as Quotation;
    });

    return NextResponse.json({ success: true, quotations, count });
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return NextResponse.json(
      { success: false, quotations: [], count: 0 },
      { status: 500 }
    );
  }
}
