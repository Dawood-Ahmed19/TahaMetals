// import { NextResponse } from "next/server";
// import { quotationDb } from "@/lib/db";

// export async function POST(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { amount, date } = await req.json();
//     const { id } = params;

//     await quotationDb.update(
//       { quotationId: id },
//       {
//         $push: { payments: { amount, date: date || new Date().toISOString() } },
//       }
//     );

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Error adding payment:", err);
//     return NextResponse.json({ success: false }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { quotationDb } from "@/lib/db";

type Payment = {
  amount: number;
  date: string;
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { amount, date } = await req.json();
    const { id } = params;

    const paymentEntry = { amount, date: date || new Date().toISOString() };

    // Append payment
    await quotationDb.update(
      { quotationId: id },
      { $push: { payments: paymentEntry } },
      {}
    );

    // Fetch updated quotation
    const updated: any = await quotationDb.findOne({ quotationId: id });

    // Normalize same as GET
    const payments: Payment[] = Array.isArray(updated?.payments)
      ? updated.payments
      : updated?.received
      ? [{ amount: updated.received, date: updated.date }]
      : [];

    const totalReceived = payments.reduce(
      (s: number, p: Payment) => s + p.amount,
      0
    );

    const balance = updated.grandTotal
      ? updated.grandTotal - totalReceived
      : updated.amount - totalReceived;

    return NextResponse.json({
      success: true,
      quotation: {
        ...updated,
        payments,
        totalReceived,
        balance,
      },
    });
  } catch (err) {
    console.error("Error adding payment:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
