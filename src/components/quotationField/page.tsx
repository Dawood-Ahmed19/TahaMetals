"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type QuotationRow = {
  qty: number | "";
  item: string;
  weight: number | "";
  rate: number | "";
  amount: number;
  uniqueKey: string;
};

interface InventoryItem {
  name: string;
  weight: number;
  rate: number;
  quantity: number;
  price: number;
}

const QuotationTable: React.FC<{ onSaveSuccess?: () => void }> = ({
  onSaveSuccess,
}) => {
  const [rows, setRows] = useState<QuotationRow[]>(
    Array.from({ length: 14 }, () => ({
      qty: 0,
      item: "",
      weight: 0,
      rate: 0,
      amount: 0,
      uniqueKey: uuidv4(),
    }))
  );

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [received, setReceived] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [quotationId, setQuotationId] = useState<string>("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        if (data.success) {
          setInventoryItems(data.items || []);
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };
    fetchInventory();
  }, []);

  // totals
  const total = rows.reduce((acc, row) => acc + row.amount, 0);
  const grandTotal = total - discount;
  const balance = grandTotal - received;

  // const saveQuotation = async () => {
  //   const validRows = rows.filter((r) => r.item && r.qty && r.rate);

  //   if (validRows.length === 0) {
  //     alert("Please add at least one item before saving.");
  //     return;
  //   }

  //   if (isNaN(received) || received < 0) {
  //     alert("❌ Please enter a valid received amount (0 if unpaid).");
  //     return;
  //   }

  //   try {
  //     const res = await fetch("/api/quotations", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         items: validRows.map((r) => ({
  //           item: r.item,
  //           qty: Number(r.qty),
  //           weight: Number(r.weight),
  //           rate: Number(r.rate),
  //         })),
  //         discount,
  //         total,
  //         grandTotal,
  //         payments:
  //           received > 0
  //             ? [{ amount: received, date: new Date().toISOString() }]
  //             : [],
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok || !data.success) {
  //       throw new Error(data?.error || "Failed to save quotation");
  //     }

  //     // Set the Quotation ID from backend response
  //     setQuotationId(data.quotation?.quotationId || "");

  //     alert("✅ Quotation saved and inventory updated!");

  //     if (onSaveSuccess) {
  //       onSaveSuccess();
  //     } else {
  //       // Don't reload, let user download PDF with correct ID
  //       // window.location.reload();
  //     }
  //   } catch (err: any) {
  //     console.error("Error in saveQuotation:", err.message);
  //     alert("❌ Error saving quotation: " + err.message);
  //   }
  // };

  // ========== New save Quotation ==============

  const saveQuotation = async () => {
    const validRows = rows.filter((r) => r.item && r.qty && r.rate);

    if (validRows.length === 0) {
      alert("Please add at least one item before saving.");
      return;
    }

    try {
      // Save quotation → backend will also deduct inventory
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validRows.map((r) => ({
            item: r.item,
            qty: Number(r.qty),
            weight: Number(r.weight), // send actual deducted weight
            rate: Number(r.rate),
          })),
          discount,
          total,
          grandTotal,
          payments:
            received > 0
              ? [{ amount: received, date: new Date().toISOString() }]
              : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to save quotation");
      }

      // ✅ we no longer call PATCH /api/items here
      setQuotationId(data.quotation?.quotationId || "");
      alert("✅ Quotation saved & inventory updated!");

      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      console.error("Error in saveQuotation:", err.message);
      alert("❌ Error saving quotation: " + err.message);
    }
  };
  // =================== HandleChange Function ===================

  // const handleChange = (
  //   index: number,
  //   field: keyof QuotationRow,
  //   value: any
  // ) => {
  //   const newRows = [...rows];
  //   let numValue = Number(value);
  //   if (isNaN(numValue) || numValue < 0) numValue = 0;

  //   if (field === "item") {
  //     const selected = inventoryItems.find((inv) => inv.name === value);

  //     if (selected) {
  //       // Compute single piece weight safely
  //       const singlePieceWeight =
  //         selected.quantity > 0 ? selected.weight / selected.quantity : 0;

  //       // ✅ Compute single piece rate (unit price) from DB values
  //       const unitPrice = singlePieceWeight * selected.price;

  //       // Default quantity is 1
  //       const qty = 1;
  //       const weight = qty * singlePieceWeight;
  //       const rate = qty * unitPrice;
  //       const amount = rate;

  //       newRows[index] = {
  //         ...newRows[index],
  //         item: value,
  //         qty,
  //         weight,
  //         rate,
  //         amount,
  //       };
  //     } else {
  //       newRows[index] = { ...newRows[index], item: value };
  //     }
  //   } else if (field === "qty") {
  //     newRows[index] = { ...newRows[index], qty: numValue };

  //     const selected = inventoryItems.find(
  //       (inv) => inv.name === newRows[index].item
  //     );

  //     if (selected && numValue > 0) {
  //       const singlePieceWeight =
  //         selected.quantity > 0 ? selected.weight / selected.quantity : 0;
  //       const unitPrice = singlePieceWeight * selected.price;

  //       const weight = numValue * singlePieceWeight;
  //       const rate = numValue * unitPrice; // total for all pieces
  //       const amount = rate;

  //       newRows[index].weight = weight;
  //       newRows[index].rate = rate;
  //       newRows[index].amount = amount;
  //     } else {
  //       newRows[index].weight = 0;
  //       newRows[index].rate = 0;
  //       newRows[index].amount = 0;
  //     }
  //   } else {
  //     // Handles direct edits on weight/rate if allowed
  //     newRows[index] = { ...newRows[index], [field]: numValue };

  //     const qty = Number(newRows[index].qty) || 0;
  //     const rate = Number(newRows[index].rate) || 0;
  //     newRows[index].amount = qty * rate;
  //   }

  //   setRows(newRows);
  // };

  // ======================== TEST WITH PROFIT

  const handleChange = (
    index: number,
    field: keyof QuotationRow,
    value: any
  ) => {
    const newRows = [...rows];
    let numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) numValue = 0;

    // User changed Item
    if (field === "item") {
      const selected = inventoryItems.find((inv) => inv.name === value);

      if (selected) {
        const singlePieceWeight =
          selected.quantity > 0 ? selected.weight / selected.quantity : 0;

        // ✅ Add profit of 10 PKR per KG
        const sellingPricePerKg = selected.price + 10;

        // Unit price for one piece = single piece weight × (price + profit)
        const unitPrice = singlePieceWeight * sellingPricePerKg;

        // Default qty = 1 when item is selected
        const qty = 1;
        const weight = qty * singlePieceWeight;
        const rate = qty * unitPrice; // total cost for selected qty
        const amount = rate;

        newRows[index] = {
          ...newRows[index],
          item: value,
          qty,
          weight,
          rate,
          amount,
        };
      } else {
        // If user types something not in inventory
        newRows[index] = { ...newRows[index], item: value };
      }
    }

    // User changed Quantity
    else if (field === "qty") {
      newRows[index] = { ...newRows[index], qty: numValue };

      const selected = inventoryItems.find(
        (inv) => inv.name === newRows[index].item
      );

      if (selected && numValue > 0) {
        const singlePieceWeight =
          selected.quantity > 0 ? selected.weight / selected.quantity : 0;

        const sellingPricePerKg = selected.price + 10;
        const unitPrice = singlePieceWeight * sellingPricePerKg;

        const weight = numValue * singlePieceWeight;
        const rate = numValue * unitPrice;
        const amount = rate;

        newRows[index].weight = weight;
        newRows[index].rate = rate;
        newRows[index].amount = amount;
      } else {
        // Reset if no qty
        newRows[index].weight = 0;
        newRows[index].rate = 0;
        newRows[index].amount = 0;
      }
    }

    // User edited Weight or Rate directly (optional override)
    else {
      newRows[index] = { ...newRows[index], [field]: numValue };

      // Recalc amount from qty × rate
      const qty = Number(newRows[index].qty) || 0;
      const rate = Number(newRows[index].rate) || 0;

      newRows[index].amount = qty * rate;
    }

    setRows(newRows);
  };

  // helper to fetch image and convert to dataURL
  async function getImageDataUrl(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Image fetch failed");
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("Could not load image", err);
      return null;
    }
  }

  // PDF generator
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);

      const doc = new jsPDF({ unit: "pt", format: "a4" });

      // Logo (flush left)
      const logoUrl = "/logo.png";
      const logoDataUrl = await getImageDataUrl(logoUrl);
      const logoX = 40;
      const logoY = 30;
      const logoW = 80;
      const logoH = 40;
      const brandX = logoX + logoW + 10;
      const brandY = logoY + 20;

      const pageWidth =
        typeof doc.internal.pageSize.getWidth === "function"
          ? doc.internal.pageSize.getWidth()
          : (doc.internal.pageSize as any).width;

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoW, logoH);
      }

      // Brand (left, next to logo)
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(253, 186, 116); // orange
      doc.text("Taha", brandX, brandY);
      const tahaWidth = (doc as any).getTextWidth("Taha");
      doc.setTextColor(0, 0, 0);
      doc.text("Metals", brandX + tahaWidth + 6, brandY);

      // Sub-header (left, under brand)
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Invoice / Quotation", brandX, brandY + 18);

      // Date (right, top)
      const today = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${today}`, pageWidth - 90, 40, { align: "right" });

      // Quotation ID (right, under date, small and gray)
      if (quotationId) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(107, 114, 128); // gray-500
        doc.text(`Quotation ID: ${quotationId}`, pageWidth - 90, 55, {
          align: "right",
        });
        doc.setTextColor(0, 0, 0); // reset to black for rest
      }

      // Table
      const head = [["Qty", "Item", "Weight", "Rate", "Amount"]];
      const body = rows
        .filter((r) => r.item && r.qty && r.rate)
        .map((r) => [
          String(r.qty),
          r.item,
          String(r.weight),
          String(r.rate),
          String(r.amount),
        ]);

      const startY = 110;
      (autoTable as any)(doc, {
        head,
        body,
        startY,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [45, 55, 72], textColor: 255 },
        margin: { left: 40, right: 40 },
      });

      const finalY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 20
        : startY + 20;

      // Totals block on right
      doc.setFontSize(11);
      const rightX = pageWidth - 160;

      doc.text(`TOTAL: ${total}`, rightX, finalY);
      doc.text(`DISCOUNT: ${discount}`, rightX, finalY + 16);
      doc.text(`BALANCE: ${balance}`, rightX, finalY + 32);
      doc.text(`GRAND TOTAL: ${grandTotal}`, rightX, finalY + 48);

      // Footer
      doc.setFontSize(10);
      doc.text(
        "Thank you for Purchasing!",
        40,
        (doc.internal.pageSize as any).height - 40
      );

      const filename = `invoice_${
        quotationId || new Date().toISOString().slice(0, 10)
      }.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <div
        id="invoice-section"
        className="flex justify-center items-center max-w-[600px] max-h-[600px] h-full bg-gray-900 text-xs"
      >
        <table
          className="text-white"
          style={{ width: "600px", height: "600px" }}
        >
          <thead>
            <tr className="bg-gray-800 text-center">
              <th className="border border-white p-2 w-[60px]">Qty</th>
              <th className="border border-white p-2 w-[180px]">Item</th>
              <th className="border border-white p-2 w-[100px]">Weight</th>
              <th className="border border-white p-2 w-[120px]">Rate</th>
              <th className="border border-white p-2 w-[140px]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border border-white">
                  <input
                    min={0}
                    type="number"
                    value={Number.isNaN(row.qty) ? "" : row.qty}
                    onChange={(e) => handleChange(i, "qty", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>

                <td className="border border-white">
                  <input
                    type="text"
                    value={row.item || ""}
                    onChange={(e) => handleChange(i, "item", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                    list="inventory-options"
                  />
                  <datalist id="inventory-options">
                    {inventoryItems
                      .filter((inv) => inv.quantity > 0)
                      .map((inv, idx) => (
                        <option key={idx} value={inv.name} />
                      ))}
                  </datalist>
                </td>

                <td className="border border-white">
                  <input
                    min={0}
                    type="text"
                    value={
                      row.weight && !Number.isNaN(row.weight)
                        ? Number(row.weight).toFixed(2)
                        : ""
                    }
                    readOnly
                    onChange={(e) => handleChange(i, "weight", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>

                <td className="border border-white">
                  <input
                    min={0}
                    type="number"
                    value={
                      Number.isNaN(row.rate) || row.rate === 0
                        ? ""
                        : Number(row.rate).toFixed(2)
                    }
                    onChange={(e) => handleChange(i, "rate", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>

                <td className="border border-white">
                  {Number.isNaN(row.amount) || row.amount === 0
                    ? ""
                    : Number(row.amount).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Totals */}
            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">TOTAL</td>
              <td className="border border-white text-center">
                {Number.isNaN(total) ? 0 : total}
              </td>
            </tr>

            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">DISCOUNT</td>
              <td className="border border-white text-center">
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="bg-transparent text-center w-full outline-none"
                />
              </td>
            </tr>

            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">RECEIVED</td>
              <td className="border border-white text-center">
                <input
                  type="number"
                  min={0}
                  value={received}
                  onChange={(e) => setReceived(Number(e.target.value) || 0)}
                  className="bg-transparent text-center w-full outline-none"
                />
              </td>
            </tr>

            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">BALANCE</td>
              <td className="border border-white text-center">
                {Number.isNaN(balance) ? 0 : balance}
              </td>
            </tr>

            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">GRAND TOTAL</td>
              <td className="border border-white text-center">
                {Number.isNaN(grandTotal) ? 0 : grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <span className="no-print flex items-center gap-4">
        <button
          onClick={saveQuotation}
          className="mt-4 bg-blue-600 px-4 py-2 rounded text-white hover:cursor-pointer"
        >
          Save
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf || !quotationId}
          className="mt-4 bg-green-600 px-4 py-2 rounded text-white hover:cursor-pointer"
        >
          {isGeneratingPdf
            ? "Generating..."
            : !quotationId
            ? "Save first"
            : "Download PDF"}
        </button>
      </span>
    </>
  );
};

export default QuotationTable;
