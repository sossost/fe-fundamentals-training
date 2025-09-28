# 리스트 렌더링 최적화

대규모 리스트에서 “좋아요” 같은 항목 단위 업데이트를 처리할 때 발생하는 **불필요한 리렌더링**을 최소화하는 방법

---

## 1. 기본 접근 (실무에서 자주 쓰는 수준)

대부분의 서비스는 아래만으로 충분:

- `React.memo` : props가 변하지 않은 행은 리렌더 스킵
- `useCallback` : 이벤트 핸들러 참조 고정
- **원시값만 props로 전달** : 배열/객체 대신 `boolean`, `number` 등으로 변환

```tsx
<MemoizedItemRow
  key={it.id}
  id={it.id}
  title={it.title}
  likeCount={it.likeCount}
  onLike={onLike}
/>
```

이 방식은 서버에서 매번 새로운 객체/배열을 내려도,
**Row가 받는 props는 원시값**이라서 `React.memo` 비교에서 동일로 처리 → 불필요한 리렌더가 발생하지 않음

---

## 2. 고급 접근 (대규모 데이터/실시간 업데이트)

데이터가 수천~수만 건이고 서버가 매번 전체 스냅샷을 내려주는 경우,
모든 객체 참조가 새로워져 **행마다 리렌더**될 수 있음

이때는 **정규화 + 병합(mergeNormalized)** 전략을 씀

- 상태를 `ids` + `byId` 구조로 정규화
- 서버 응답 시 `mergeNormalized`로 이전 상태와 비교
- **값이 바뀐 항목만 새 객체**, 나머지는 이전 참조를 재사용

```ts
function mergeNormalized(
  prev: ItemsNormalized | null,
  nextArr: ItemData[]
): ItemsNormalized {
  if (!prev) return normalize(nextArr);
  const byId: Record<string, ItemData> = {};
  const ids: string[] = [];

  for (const it of nextArr) {
    ids.push(it.id);
    const prevIt = prev.byId[it.id];

    const same =
      prevIt &&
      prevIt.title === it.title &&
      prevIt.likeCount === it.likeCount &&
      prevIt.likedUsers.length === it.likedUsers.length &&
      prevIt.likedUsers.every((u, i) => u === it.likedUsers[i]);

    byId[it.id] = same ? prevIt : it;
  }
  return { ids, byId };
}
```

→ 이 방식이면 서버에서 새로운 배열을 내려도,
**변경된 항목만 리렌더**되고 나머지는 참조 유지로 스킵

---

## 3. 가상화와 함께 쓰기

데이터가 많으면 **react-window / react-virtualized** 같은 가상화 라이브러리를 함께 사용:

- **가상화** : “보이는 몇십 개 행”만 DOM에 렌더
- **정규화/메모** : 보이는 행 중에서도 “바뀐 행만 리렌더”

이 두 가지를 합치면 수천~수만 건의 리스트도 실시간으로 부드럽게 업데이트할 수 있음

---

## 4. 요약

- **일반 서비스**:
  `React.memo` + `useCallback` + 원시값 props + 필요 시 가상화 → 충분
- **대규모 실시간 데이터**:
  정규화 + 병합(mergeNormalized) → 변경된 항목만 새 객체
- **항상 기억할 점**:
  `React.memo`는 **props 값이 같을 때만** 스킵한다.
  배열/객체는 참조가 매번 새로워지므로 → 원시값으로 바꾸거나, 참조를 재사용 해야함
