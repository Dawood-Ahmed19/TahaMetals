// import { NextResponse } from "next/server";
// import { quotationDb, inventoryDb } from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     const { items, discount, received, total, grandTotal } = await req.json();

//     // Validate each item against inventory
//     for (const soldItem of items) {
//       const { item, qty, weight } = soldItem;

//       const inventoryItem: any = await inventoryDb.findOne({ name: item });

//       if (!inventoryItem) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `❌ No item available with the name "${item}".`,
//           },
//           { status: 400 }
//         );
//       }

//       if (Number(weight) !== Number(inventoryItem.weight)) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `❌ Weight mismatch for "${item}". Available: ${inventoryItem.weight}, Entered: ${weight}`,
//           },
//           { status: 400 }
//         );
//       }

//       if (Number(qty) > Number(inventoryItem.quantity)) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `❌ Not enough stock for "${item}". Available: ${inventoryItem.quantity}, Requested: ${qty}`,
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Generate quotation ID
//     const count = await quotationDb.count({});
//     const quotationId = `QTN-${String(count + 1).padStart(4, "0")}`;

//     // Initial payments array (first received on creation)
//     const payments =
//       received > 0
//         ? [{ amount: received, date: new Date().toISOString() }]
//         : [];

//     // Insert new quotation
//     const newQuotation = await quotationDb.insert({
//       quotationId,
//       items,
//       discount,
//       total,
//       grandTotal,
//       payments,
//       amount: grandTotal, // for compatibility
//       date: new Date().toISOString(),
//     });

//     // Update inventory stock
//     for (const soldItem of items) {
//       const { item, qty } = soldItem;
//       const inventoryItem: any = await inventoryDb.findOne({ name: item });

//       if (inventoryItem) {
//         const newQty = (inventoryItem.quantity || 0) - Number(qty);
//         await inventoryDb.update(
//           { _id: inventoryItem._id },
//           { $set: { quantity: newQty } }
//         );
//       }
//     }

//     return NextResponse.json({ success: true, quotation: newQuotation });
//   } catch (err: any) {
//     console.error("Error saving quotation:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to save quotation" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     let quotations = await quotationDb.find({}).sort({ date: -1 }).limit(10);
//     const count = await quotationDb.count({});

//     // ✅ Normalize & calculate balance dynamically
//     quotations = quotations.map((q: any) => {
//       const payments = Array.isArray(q.payments)
//         ? q.payments
//         : q.received
//         ? [{ amount: q.received, date: q.date }]
//         : [];

//       const totalReceived = payments.reduce(
//         (s: any, p: any) => s + p.amount,
//         0
//       );
//       const balance = q.grandTotal
//         ? q.grandTotal - totalReceived
//         : q.amount - totalReceived;

//       return {
//         ...q,
//         payments,
//         totalReceived,
//         balance,
//       };
//     });

//     return NextResponse.json({ success: true, quotations, count });
//   } catch (err) {
//     console.error("Error fetching quotations:", err);
//     return NextResponse.json(
//       { success: false, quotations: [], count: 0 },
//       { status: 500 }
//     );
//   }
// }

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

// export async function POST(req: Request) {
//   try {
//     const { items, discount, received, total, grandTotal } = await req.json();

//     // Validate each item against inventory
//     for (const soldItem of items) {
//       const { item, qty, weight } = soldItem;
//       const inventoryItem: any = await inventoryDb.findOne({ name: item });

//       if (!inventoryItem) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `❌ No item available with the name "${item}".`,
//           },
//           { status: 400 }
//         );
//       }

//       if (Number(weight) !== Number(inventoryItem.weight)) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `❌ Weight mismatch for "${item}". Available: ${inventoryItem.weight}, Entered: ${weight}`,
//           },
//           { status: 400 }
//         );
//       }

//       if (Number(qty) > Number(inventoryItem.quantity)) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `❌ Not enough stock for "${item}". Available: ${inventoryItem.quantity}, Requested: ${qty}`,
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Quotation ID
//     const count = await quotationDb.count({});
//     const quotationId = `QTN-${String(count + 1).padStart(4, "0")}`;

//     // Initial payments
//     const payments: Payment[] =
//       received > 0
//         ? [{ amount: received, date: new Date().toISOString() }]
//         : [];

//     // Insert quotation
//     const inserted = await quotationDb.insert({
//       quotationId,
//       items,
//       discount,
//       total,
//       grandTotal,
//       payments,
//       amount: grandTotal, // keep for compatibility
//       date: new Date().toISOString(),
//     });

//     // Update inventory stock
//     for (const soldItem of items) {
//       const { item, qty } = soldItem;
//       const inventoryItem: any = await inventoryDb.findOne({ name: item });

//       if (inventoryItem) {
//         const newQty = (inventoryItem.quantity || 0) - Number(qty);
//         await inventoryDb.update(
//           { _id: inventoryItem._id },
//           { $set: { quantity: newQty } }
//         );
//       }
//     }

//     // Normalize before return
//     const totalReceived = payments.reduce(
//       (s: number, p: Payment) => s + p.amount,
//       0
//     );
//     const balance = grandTotal - totalReceived;

//     const normalized: Quotation = {
//       ...inserted,
//       payments,
//       totalReceived,
//       balance,
//     };

//     return NextResponse.json({ success: true, quotation: normalized });
//   } catch (err: any) {
//     console.error("Error saving quotation:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to save quotation" },
//       { status: 500 }
//     );
//   }
// }
export async function POST(req: Request) {
  try {
    const { items, discount, total, grandTotal, payments } = await req.json();

    // validate items...

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

    // inventory update logic ...

    // Normalize before returning
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
