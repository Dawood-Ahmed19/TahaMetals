// import { NextResponse } from "next/server";
// import { inventoryDb } from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     let { name, type, gote, guage, pipeType, size, weight, quantity, price } =
//       await req.json();

//     // Normalize all comparable fields
//     name = String(name).trim().toLowerCase();
//     type = String(type).trim().toLowerCase();
//     pipeType = String(pipeType).trim().toLowerCase();
//     guage = String(guage).trim().toLowerCase();
//     gote = String(gote).trim().toLowerCase();
//     size = String(size).trim().toLowerCase();
//     weight = Number(weight);

//     // Check DB for existing item with same specs
//     const existingItem = await inventoryDb.findOne({
//       name,
//       type,
//       pipeType,
//       gote,
//       guage,
//       size,
//       weight,
//     });

//     console.log("Existing item found:", existingItem);

//     if (existingItem) {
//       await inventoryDb.update(
//         { _id: existingItem._id },
//         {
//           $inc: { quantity: Number(quantity) }, // increment instead of replace
//           $set: { date: new Date().toISOString() },
//         }
//       );

//       return NextResponse.json({
//         success: true,
//         message: "Quantity updated ✅",
//         updatedId: existingItem._id,
//       });
//     }

//     // Else insert as new
//     const newItem = await inventoryDb.insert({
//       name,
//       type,
//       gote,
//       guage,
//       size,
//       weight,
//       quantity: Number(quantity),
//       price: Number(price),
//       date: new Date().toISOString(),
//     });

//     return NextResponse.json({
//       success: true,
//       message: "New item created ✅",
//       item: newItem,
//     });
//   } catch (err) {
//     console.error("Error in inventory POST:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to add/update item ❌" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { inventoryDb } from "@/lib/db";

interface InventoryItem {
  _id?: string;
  name: string;
  type: string;
  pipeType?: string;
  guage?: string | number;
  gote?: string | number;
  size: string;
  weight: number;
  quantity: number;
  price: number;
  date: string;
  index?: number;
}

export async function POST(req: Request) {
  try {
    let {
      name,
      type,
      pipeType,
      guage,
      gote,
      size,
      weight,
      quantity,
      price,
      height,
    } = await req.json();

    // ✅ Normalize values
    type = String(type).trim().toLowerCase();
    pipeType = String(pipeType || "")
      .trim()
      .toLowerCase();
    guage = guage ? String(guage).trim().toLowerCase() : "";
    gote = gote ? String(gote).trim().toLowerCase() : "";
    size = String(size).trim().toLowerCase();
    weight = Number(weight);
    quantity = Number(quantity);
    price = Number(price);

    let generatedName = name;

    // ✅ Auto-generate Pipe Code here in backend
    if (type === "pipe") {
      // Find the last Pipe in DB ordered by index
      const lastPipe = (await inventoryDb
        .find({ type: "pipe" })
        .sort({ index: -1 })
        .limit(1)) as InventoryItem[];

      const nextNumber =
        lastPipe.length > 0 && lastPipe[0].index !== undefined
          ? lastPipe[0].index + 1
          : 1;

      const generatedName = `p${String(nextNumber).padStart(3, "0")}`;
    }

    // ✅ Check if item with same specs already exists (merge instead of duplicate)
    const existingItem: any = await inventoryDb.findOne({
      name: generatedName, // code like p001
      type,
      pipeType,
      guage,
      gote,
      size,
      weight,
    });

    if (existingItem) {
      // If found, update quantity instead of creating duplicate
      await inventoryDb.update(
        { _id: existingItem._id },
        {
          $inc: { quantity: quantity },
          $set: { date: new Date().toISOString() },
        }
      );
      return NextResponse.json({
        success: true,
        message: "Quantity updated on existing item ✅",
        updatedId: existingItem._id,
      });
    }

    // ✅ Otherwise, create new item
    const newItem = await inventoryDb.insert({
      name: generatedName,
      type,
      pipeType,
      guage,
      gote,
      size,
      weight,
      quantity,
      price,
      height: height || null,
      index: type === "pipe" ? parseInt(generatedName.slice(1)) : undefined, // store the numeric index for pipes
      date: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "New item created ✅",
      item: newItem,
    });
  } catch (err) {
    console.error("Error in items POST:", err);
    return NextResponse.json(
      { success: false, error: "Failed to add/update item ❌" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const items = await inventoryDb.find({});
    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return NextResponse.json({ success: false, items: [] }, { status: 500 });
  }
}
