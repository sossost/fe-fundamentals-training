import React, { useCallback, useEffect, useMemo, useState } from "react";

import { fetchItems, likeItem } from "../api/api";
import type { ItemData } from "../types/types";
import { MemoizedItemRow } from "./Item";

type ItemsNormalized = {
  ids: string[];
  byId: Record<string, ItemData>;
};

// ✅ shallowEqualItem: 두 아이템이 동일한지 판별
// - title, likeCount, likedUsers 배열의 길이와 각 요소를 비교
// - 값이 같으면 이전 객체 참조를 재사용할 수 있도록 도와줌
function shallowEqualItem(a: ItemData, b: ItemData) {
  if (a.title !== b.title) return false;
  if (a.likeCount !== b.likeCount) return false;
  if (a.likedUsers.length !== b.likedUsers.length) return false;
  for (let i = 0; i < a.likedUsers.length; i++) {
    if (a.likedUsers[i] !== b.likedUsers[i]) return false;
  }
  return true;
}

// ✅ mergeNormalized: 서버에서 새 데이터를 받았을 때 이전 상태와 병합
// - 변경된 항목만 새 객체로 교체
// - 값이 동일한 항목은 이전 객체를 그대로 재사용 (참조 유지)
//   → React.memo 비교에서 "props 동일"로 판정되어 불필요한 리렌더 방지
function mergeNormalized(
  prev: ItemsNormalized | null,
  nextArr: ItemData[]
): ItemsNormalized {
  if (!prev) {
    return {
      ids: nextArr.map((x) => x.id),
      byId: Object.fromEntries(nextArr.map((x) => [x.id, x])),
    };
  }
  const nextById: Record<string, ItemData> = {};
  const nextIds: string[] = new Array(nextArr.length);

  for (let i = 0; i < nextArr.length; i++) {
    const next = nextArr[i];
    nextIds[i] = next.id;
    const prevItem = prev.byId[next.id];

    // ✅ 값이 동일하면 이전 객체 참조 재사용
    //    → 참조 안정성 유지 → React.memo가 스킵
    nextById[next.id] =
      prevItem && shallowEqualItem(prevItem, next) ? prevItem : next;
  }
  return { ids: nextIds, byId: nextById };
}

export default function OptimizedList() {
  const [data, setData] = useState<ItemsNormalized | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ onLike: 좋아요 클릭 핸들러
  // - 서버에 likeItem 요청 후 fetchItems로 새 데이터 수신
  // - 병합(mergeNormalized)으로 참조 안정화 → 변경된 항목만 리렌더
  const onLike = useCallback(async (id: string) => {
    likeItem(id, "1").then(async () => {
      const fresh = await fetchItems();
      setData((prev) => mergeNormalized(prev, fresh));
    });
  }, []);

  // ✅ rows: ids 배열을 이용해 정규화된 데이터를 순서대로 풀어냄
  // - useMemo로 data가 바뀔 때만 재계산
  const rows = useMemo(
    () => (data ? data.ids.map((id) => data.byId[id]) : []),
    [data]
  );

  // ✅ 초기 데이터 로드
  useEffect(() => {
    fetchItems().then((res) => {
      setData((prev) => mergeNormalized(prev, res));
      setLoading(false);
    });
  }, []);

  if (loading) return <p>로딩 중…</p>;

  return (
    <ul>
      {rows.map((it: ItemData) => (
        <MemoizedItemRow
          key={it.id}
          id={it.id}
          title={it.title}
          likeCount={it.likeCount}
          // ❗ 배열 같은 참조형 데이터는 서버 응답마다 새로워질 수 있음
          //   → mergeNormalized를 통해 참조 안정성을 유지해야
          //     React.memo 비교에서 "동일" 판정을 받고 리렌더를 막을 수 있음
          likedUsers={it.likedUsers}
          onLike={onLike}
        />
      ))}
    </ul>
  );
}
