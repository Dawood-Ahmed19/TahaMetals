import { inventoryDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await inventoryDb.findOne({ _id: params.id });

    if (!item) {
      return new Response(
        JSON.stringify({ success: false, error: "Item not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, item }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const item = await inventoryDb.insert(body);

    return new Response(JSON.stringify({ success: true, item }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to save" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("API DELETE called for:", id);

    const numRemoved = await inventoryDb.remove({ _id: id }, {});
    if (numRemoved > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("Error deleting item:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const numAffected = await inventoryDb.update(
      { _id: params.id },
      { $set: body }
    );

    if (numAffected === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Item not found" }),
        { status: 404 }
      );
    }

    const updatedDoc = await inventoryDb.findOne({ _id: params.id });

    return new Response(JSON.stringify({ success: true, item: updatedDoc }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500 }
    );
  }
}
