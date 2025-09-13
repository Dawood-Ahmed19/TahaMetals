"use client";

import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { addItem, editItem } from "@/redux/itemsSlice";
import ItemCard from "@/components/itemCard/page";
import { useEffect, useState } from "react";

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const item = useSelector((state: RootState) =>
    state.items.list.find((i) => String(i._id) === String(id))
  );

  useEffect(() => {
    const fetchItem = async () => {
      if (!item && id) {
        try {
          const res = await fetch(`/api/items/${id}`);
          const result = await res.json();
          if (result.success) {
            dispatch(addItem(result.item));
          }
        } catch (err) {
          console.error("Failed to fetch item:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, item, dispatch]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (!item) return <p className="text-red-400">Item not found</p>;

  const handleUpdate = async (updatedData: typeof item) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();

      if (result.success) {
        dispatch(editItem(result.item));
        router.push("/inventory");
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center w-full h-full justify-center py-[35px] px-[72px] gap-[65px]">
      <span className="flex justify-between w-full">
        <h1 className="text-xl font-bold text-white">Edit your Item</h1>
        <p className="text-sm text-white">{formattedDate}</p>
      </span>
      <ItemCard
        initialData={{
          id: item._id ?? "",
          name: item.name,
          type: item.type,
          pipeType: (item as any).pipeType ?? "",
          guage: item.guage,
          gote: item.gote,
          size: item.size as any,
          weight: item.weight,
          price: item.price,
          quantity: item.quantity,
          height: (item as any).height,
          date: (item as any).date ?? new Date().toISOString(),
        }}
        onSubmit={handleUpdate}
        isEdit={true}
      />
    </div>
  );
}
