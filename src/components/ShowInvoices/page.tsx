"use client";

import { useEffect, useState } from "react";
import RecentInvoice from "../RecentInvoice/page";

interface Quotation {
  _id: string;
  quotationId: string;
  date: string;
  items: { qty: number; rate: number }[];
  discount: number;
  amount: number;
  received: number;
  balance: number;
}

const ShowInvoices = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await fetch("/api/quotations");
        const data = await res.json();
        if (data.success) {
          const sorted = data.quotations.sort((a: Quotation, b: Quotation) => {
            if (a.balance > 0 && b.balance <= 0) return -1;
            if (a.balance <= 0 && b.balance > 0) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

          setQuotations(sorted);
        }
      } catch (err) {
        console.error("Error fetching quotations:", err);
      }
    };

    fetchQuotations();
  }, []);
  return (
    <span className="max-h-[600px] h-full w-full overflow-y-auto bg-cardBg rounded-lg">
      <p className="text-lg text-white px-[50px] py-[20px]">Recent Invoices</p>

      {/* Table Header */}
      <div className="flex items-center justify-between h-[70px] w-full bg-BgColor px-[50px]">
        <p className="text-white text-xs w-[100px]">Invoice Id</p>
        <p className="text-white text-xs w-[120px]">Date</p>
        <p className="text-white text-xs w-[80px] text-center">Discount</p>
        <p className="text-white text-xs w-[100px] text-center">Amount</p>
        <p className="text-white text-xs w-[100px] text-center">Received</p>
        <p className="text-white text-xs w-[100px] text-center">Balance</p>
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
              amount={q.amount}
              received={q.received}
              balance={q.balance}
            />
          ))
        )}
      </div>
    </span>
  );
};

export default ShowInvoices;
