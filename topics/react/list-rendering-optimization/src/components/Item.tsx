import React, { useCallback, useRef } from "react";

type Props = {
  id: string;
  title: string;
  likeCount: number;
  likedUsers: string[];
  onLike: (id: string) => void;
};

const ItemRow = function ItemRow({
  id,
  title,
  likeCount,
  likedUsers,
  onLike,
}: Props) {
  const renders = useRef(0);
  renders.current += 1;

  const handleClick = useCallback(() => onLike(id), [onLike, id]);

  return (
    <li>
      {title} · ❤️ {likeCount} <button onClick={handleClick}>좋아요</button>
      {"  "}
      {likedUsers.map((user) => user).join(", ")}
      <small>(renders: {renders.current})</small>
    </li>
  );
};

export const MemoizedItemRow = React.memo(ItemRow);
export const NativeItemRow = ItemRow;
