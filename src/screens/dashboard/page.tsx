// "use client";

// import { useEffect, useState } from "react";
// import TotalItem from "@/components/totalitem/page";
// import TotalQuotations from "@/components/totalQuot/page";
// import RecentInvoice from "@/components/RecentInvoice/page";

// interface Quotation {
//   _id: string;
//   quotationId: string;
//   date: string;
//   items: { qty: number; rate: number }[];
//   discount: number;
//   amount: number;
// }

// export default function DashboardScreen() {
//   const today = new Date();

//   const formattedDate = today.toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   const [quotations, setQuotations] = useState<Quotation[]>([]);

//   useEffect(() => {
//     const fetchQuotations = async () => {
//       try {
//         const res = await fetch("/api/quotations");
//         const data = await res.json();
//         if (data.success) {
//           setQuotations(data.quotations);
//         }
//       } catch (err) {
//         console.error("Error fetching quotations:", err);
//       }
//     };

//     fetchQuotations();
//   }, []);

//   return (
//     <div className="px-[75px] py-[35px] h-full flex flex-col items-center gap-[50px]">
//       {/* Header */}
//       <span className="flex justify-between w-full">
//         <h1 className="text-xl font-bold text-white">Dashboard</h1>
//         <p className="text-sm text-white">{formattedDate}</p>
//       </span>

//       {/* Cards */}
//       <span className="w-full flex items-center justify-start gap-6">
//         <TotalItem />
//         <TotalQuotations />
//       </span>

//       {/* Recent Invoices */}
//       <span className="max-h-[600px] h-full w-full overflow-y-auto bg-cardBg rounded-lg">
//         <p className="text-lg text-white px-[50px] py-[20px]">
//           Recent Invoices
//         </p>

//         {/* Table Header */}
//         <div className="flex items-center justify-between h-[70px] w-full bg-BgColor px-[50px]">
//           <p className="text-white text-xs">Invoice Id</p>
//           <p className="text-white text-xs">Date</p>
//           <p className="text-white text-xs">Discount</p>
//           <p className="text-white text-xs">Amount</p>
//         </div>

//         {/* Table Body */}
//         <div className="flex flex-col gap-4 px-[50px] py-[20px]">
//           {quotations.length === 0 ? (
//             <p className="text-gray-400 text-sm">No invoices yet.</p>
//           ) : (
//             quotations.map((q) => {
//               const amount = q.amount;
//               return (
//                 <RecentInvoice
//                   key={q._id}
//                   quotationId={q.quotationId}
//                   date={q.date}
//                   discount={q.discount}
//                   amount={amount}
//                 />
//               );
//             })
//           )}
//         </div>
//       </span>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import TotalItem from "@/components/totalitem/page";
import TotalQuotations from "@/components/totalQuot/page";
import RecentInvoice from "@/components/RecentInvoice/page";

interface Quotation {
  _id: string;
  quotationId: string;
  date: string;
  items: { qty: number; rate: number }[];
  discount: number;
  total: number;
  grandTotal: number;
  received: number;
  balance: number;
}

export default function DashboardScreen() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await fetch("/api/quotations");
        const data = await res.json();
        if (data.success) {
          setQuotations(data.quotations);
        }
      } catch (err) {
        console.error("Error fetching quotations:", err);
      }
    };

    fetchQuotations();
  }, []);

  return (
    <div className="px-[75px] py-[35px] h-full flex flex-col items-center gap-[50px]">
      {/* Header */}
      <span className="flex justify-between w-full">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white">{formattedDate}</p>
      </span>

      {/* Cards */}
      <span className="w-full flex items-center justify-start gap-6">
        <TotalItem />
        <TotalQuotations />
      </span>

      {/* Recent Invoices */}
      <span className="max-h-[600px] h-full w-full overflow-y-auto bg-cardBg rounded-lg">
        <p className="text-lg text-white px-[50px] py-[20px]">
          Recent Invoices
        </p>

        {/* Table Header */}
        <div className="flex items-center justify-between h-[70px] w-full bg-BgColor px-[50px]">
          <p className="text-white text-xs w-[100px]">Invoice Id</p>
          <p className="text-white text-xs w-[120px]">Date</p>
          <p className="text-white text-xs w-[80px]">Discount</p>
          <p className="text-white text-xs w-[100px]">Grand Total</p>
          <p className="text-white text-xs w-[100px]">Received</p>
          <p className="text-white text-xs w-[100px]">Balance</p>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-4 px-[50px] py-[20px]">
          {quotations.length === 0 ? (
            <p className="text-gray-400 text-sm">No invoices yet.</p>
          ) : (
            quotations.map((q) => (
              <RecentInvoice
                key={q._id}
                quotationId={q.quotationId}
                date={q.date}
                discount={q.discount}
                amount={q.grandTotal}
                received={q.received}
                balance={q.balance}
              />
            ))
          )}
        </div>
      </span>
    </div>
  );
}
