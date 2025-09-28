import type { ItemData } from "../types/types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const DB: Record<string, ItemData> = Object.fromEntries(
  Array.from({ length: 1000 }, (_, i) => {
    const id = String(i + 1);
    return [id, { id, title: `Item ${id}`, likeCount: 0, likedUsers: [] }];
  })
);

export async function fetchItems(): Promise<ItemData[]> {
  await sleep(300);

  // 실제 서버 처럼 JSON 직렬화/파싱을 거쳐 항상 새로운 객체/배열 반환
  return JSON.parse(JSON.stringify(Object.values(DB)));
}

export async function likeItem(id: string, userId: string): Promise<void> {
  await sleep(250);

  if (DB[id].likedUsers.includes(userId)) {
    DB[id].likeCount -= 1;
    DB[id].likedUsers = DB[id].likedUsers.filter((user) => user !== userId);
    return;
  } else {
    DB[id].likeCount += 1;
    DB[id].likedUsers.push(userId);
  }
}
