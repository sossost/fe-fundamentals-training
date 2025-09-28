import React, { useEffect, useState } from "react";
import { fetchItems, likeItem } from "../api/api";
import type { ItemData } from "../types/types";
import { NativeItemRow } from "./Item";

export default function NaiveList() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const onLike = async (id: string) => {
    await likeItem(id, "1");
    const fresh = await fetchItems();
    setItems(fresh);
  };

  useEffect(() => {
    fetchItems().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>로딩 중…</p>;

  return (
    <ul>
      {items.map((it) => (
        <NativeItemRow
          key={it.id}
          id={it.id}
          title={it.title}
          likeCount={it.likeCount}
          likedUsers={it.likedUsers}
          onLike={onLike}
        />
      ))}
    </ul>
  );
}
