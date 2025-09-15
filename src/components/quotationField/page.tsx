// import React, { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// type QuotationRow = {
//   qty: number | "";
//   item: string;
//   weight: number | "";
//   rate: number | "";
//   amount: number;
//   uniqueKey: string;
// };

// const QuotationTable: React.FC<{ onSaveSuccess?: () => void }> = ({
//   onSaveSuccess,
// }) => {
//   const [rows, setRows] = useState<QuotationRow[]>(
//     Array.from({ length: 14 }, () => ({
//       qty: "",
//       item: "",
//       weight: "",
//       rate: "",
//       amount: 0,
//       uniqueKey: uuidv4(),
//     }))
//   );
//   const [discount, setDiscount] = useState<number>(0);

//   const saveQuotation = async () => {
//     const validRows = rows.filter((r) => r.item && r.qty && r.rate);

//     if (validRows.length === 0) {
//       alert("Please add at least one item before saving.");
//       return;
//     }

//     try {
//       const res = await fetch("/api/quotations", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           items: validRows.map((r) => ({
//             item: r.item,
//             qty: Number(r.qty),
//             weight: Number(r.weight),
//             rate: Number(r.rate), // ✅ include rate
//           })),
//           discount,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data?.error || "Failed to save quotation");
//       }

//       alert("✅ Quotation saved and inventory updated!");

//       if (onSaveSuccess) {
//         onSaveSuccess();
//       } else {
//         window.location.reload();
//       }
//     } catch (err: any) {
//       console.error("Error in saveQuotation:", err.message);
//       alert("❌ Error saving quotation: " + err.message);
//     }
//   };

//   const handleChange = (
//     index: number,
//     field: keyof QuotationRow,
//     value: any
//   ) => {
//     const newRows = [...rows];

//     let numValue = Number(value);
//     if (isNaN(numValue) || numValue < 0) numValue = 0;

//     newRows[index] = {
//       ...newRows[index],
//       [field]: field === "item" ? value : numValue,
//     };

//     const qty = Number(newRows[index].qty) || 0;
//     const rate = Number(newRows[index].rate) || 0;
//     newRows[index].amount = qty * rate;

//     setRows(newRows);
//   };

//   const total = rows.reduce((acc, row) => acc + row.amount, 0);
//   const grandTotal = total - discount;

//   return (
//     <>
//       <div className="flex justify-center items-center max-w-[600px] max-h-[600px] h-full bg-gray-900 text-xs">
//         <table
//           className="text-white"
//           style={{ width: "600px", height: "600px" }}
//         >
//           <thead>
//             <tr className="bg-gray-800 text-center">
//               <th className="border border-white p-2 w-[60px]">Qty</th>
//               <th className="border border-white p-2 w-[180px]">Item</th>
//               <th className="border border-white p-2 w-[100px]">Weight</th>
//               <th className="border border-white p-2 w-[120px]">Rate</th>
//               <th className="border border-white p-2 w-[140px]">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i} className="text-center">
//                 <td className="border border-white">
//                   <input
//                     min={0}
//                     type="number"
//                     value={row.qty}
//                     onChange={(e) => handleChange(i, "qty", e.target.value)}
//                     className="bg-transparent text-center w-full outline-none"
//                   />
//                 </td>
//                 <td className="border border-white">
//                   <input
//                     min={0}
//                     type="text"
//                     value={row.item}
//                     onChange={(e) => handleChange(i, "item", e.target.value)}
//                     className="bg-transparent text-center w-full outline-none"
//                   />
//                 </td>
//                 <td className="border border-white">
//                   <input
//                     min={0}
//                     type="number"
//                     value={row.weight}
//                     onChange={(e) => handleChange(i, "weight", e.target.value)}
//                     className="bg-transparent text-center w-full outline-none"
//                   />
//                 </td>
//                 <td className="border border-white">
//                   <input
//                     min={0}
//                     type="number"
//                     value={row.rate}
//                     onChange={(e) => handleChange(i, "rate", e.target.value)}
//                     className="bg-transparent text-center w-full outline-none"
//                   />
//                 </td>
//                 <td className="border border-white">{row.amount || ""}</td>
//               </tr>
//             ))}

//             <tr className="bg-gray-800 font-bold">
//               <td colSpan={3} className="border border-white"></td>
//               <td className="border border-white text-center">TOTAL</td>
//               <td className="border border-white text-center">{total}</td>
//             </tr>

//             <tr className="bg-gray-800 font-bold">
//               <td colSpan={3} className="border border-white"></td>
//               <td className="border border-white text-center">DISCOUNT</td>
//               <td className="border border-white text-center">
//                 <input
//                   type="number"
//                   min={0}
//                   value={discount}
//                   onChange={(e) => setDiscount(Number(e.target.value) || 0)}
//                   className="bg-transparent text-center w-full outline-none"
//                 />
//               </td>
//             </tr>
//             <tr className="bg-gray-800 font-bold">
//               <td colSpan={3} className="border border-white"></td>
//               <td className="border border-white text-center">RECIEVED</td>
//               <td className="border border-white text-center">
//                 <input
//                   type="number"
//                   min={0}
//                   value={discount}
//                   onChange={(e) => setDiscount(Number(e.target.value) || 0)}
//                   className="bg-transparent text-center w-full outline-none"
//                 />
//               </td>
//             </tr>
//             <tr className="bg-gray-800 font-bold">
//               <td colSpan={3} className="border border-white"></td>
//               <td className="border border-white text-center">BALANCE</td>
//               <td className="border border-white text-center">
//                 <input
//                   type="number"
//                   min={0}
//                   value={discount}
//                   onChange={(e) => setDiscount(Number(e.target.value) || 0)}
//                   className="bg-transparent text-center w-full outline-none"
//                 />
//               </td>
//             </tr>

//             <tr className="bg-gray-800 font-bold">
//               <td colSpan={3} className="border border-white"></td>
//               <td className="border border-white text-center">GRAND TOTAL</td>
//               <td className="border border-white text-center">{grandTotal}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <span className="flex items-center gap-4">
//         <button
//           onClick={saveQuotation}
//           className="mt-4 bg-blue-600 px-4 py-2 rounded text-white hover:cursor-pointer"
//         >
//           Save
//         </button>
//         <button className="mt-4 bg-blue-600 px-4 py-2 rounded text-white hover:cursor-pointer">
//           Print
//         </button>
//       </span>
//     </>
//   );
// };

// export default QuotationTable;

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type QuotationRow = {
  qty: number | "";
  item: string;
  weight: number | "";
  rate: number | "";
  amount: number;
  uniqueKey: string;
};

const QuotationTable: React.FC<{ onSaveSuccess?: () => void }> = ({
  onSaveSuccess,
}) => {
  const [rows, setRows] = useState<QuotationRow[]>(
    Array.from({ length: 14 }, () => ({
      qty: "",
      item: "",
      weight: "",
      rate: "",
      amount: 0,
      uniqueKey: uuidv4(),
    }))
  );

  const [discount, setDiscount] = useState<number>(0);
  const [received, setReceived] = useState<number>(0);

  // calculate totals
  const total = rows.reduce((acc, row) => acc + row.amount, 0);
  const grandTotal = total - discount;
  const balance = grandTotal - received;

  const saveQuotation = async () => {
    const validRows = rows.filter((r) => r.item && r.qty && r.rate);

    if (validRows.length === 0) {
      alert("Please add at least one item before saving.");
      return;
    }

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validRows.map((r) => ({
            item: r.item,
            qty: Number(r.qty),
            weight: Number(r.weight),
            rate: Number(r.rate),
          })),
          discount,
          received,
          balance,
          total,
          grandTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to save quotation");
      }

      alert("✅ Quotation saved and inventory updated!");

      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Error in saveQuotation:", err.message);
      alert("❌ Error saving quotation: " + err.message);
    }
  };

  const handleChange = (
    index: number,
    field: keyof QuotationRow,
    value: any
  ) => {
    const newRows = [...rows];
    let numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) numValue = 0;

    newRows[index] = {
      ...newRows[index],
      [field]: field === "item" ? value : numValue,
    };

    const qty = Number(newRows[index].qty) || 0;
    const rate = Number(newRows[index].rate) || 0;
    newRows[index].amount = qty * rate;

    setRows(newRows);
  };

  return (
    <>
      <div className="flex justify-center items-center max-w-[600px] max-h-[600px] h-full bg-gray-900 text-xs">
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
                    value={row.qty}
                    onChange={(e) => handleChange(i, "qty", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>
                <td className="border border-white">
                  <input
                    type="text"
                    value={row.item}
                    onChange={(e) => handleChange(i, "item", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>
                <td className="border border-white">
                  <input
                    min={0}
                    type="number"
                    value={row.weight}
                    onChange={(e) => handleChange(i, "weight", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>
                <td className="border border-white">
                  <input
                    min={0}
                    type="number"
                    value={row.rate}
                    onChange={(e) => handleChange(i, "rate", e.target.value)}
                    className="bg-transparent text-center w-full outline-none"
                  />
                </td>
                <td className="border border-white">{row.amount || ""}</td>
              </tr>
            ))}

            {/* Totals */}
            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">TOTAL</td>
              <td className="border border-white text-center">{total}</td>
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
              <td className="border border-white text-center">{balance}</td>
            </tr>

            <tr className="bg-gray-800 font-bold">
              <td colSpan={3} />
              <td className="border border-white text-center">GRAND TOTAL</td>
              <td className="border border-white text-center">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <span className="flex items-center gap-4">
        <button
          onClick={saveQuotation}
          className="mt-4 bg-blue-600 px-4 py-2 rounded text-white hover:cursor-pointer"
        >
          Save
        </button>
        <button className="mt-4 bg-blue-600 px-4 py-2 rounded text-white hover:cursor-pointer">
          Print
        </button>
      </span>
    </>
  );
};

export default QuotationTable;
