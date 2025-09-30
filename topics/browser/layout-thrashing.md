# 레이아웃 스레싱

```typescript
export default function BoxMover() {
  useEffect(() => {
    const box = document.getElementById("box")!;
    for (let i = 0; i < 1000; i++) {
      box.style.left = `${i}px`;
      console.log(box.offsetHeight);
    }
  }, []);

  return (
    <div
      id="box"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        background: "tomato",
      }}
    />
  );
}
```

## 1. 브라우저 기본 동작

- DOM 스타일을 여러 번 바꿔도 브라우저는 바로 레이아웃 계산·페인트를 하지 않음
- 변경 사항을 큐에 모아두고 렌더링 타이밍에 한 번에 처리(batch)
- 따라서 `for` 루프에서 `box.style.left = ...`를 여러 번 실행해도 **마지막 값만 반영**

---

## 2. 강제 Reflow(Forced Layout)

- DOM 속성을 읽는 순간 최신 레이아웃 값이 필요
- 예: `offsetHeight`, `getBoundingClientRect()`, `scrollTop`
- 이때 브라우저는 지금까지의 변경을 모두 적용하고 레이아웃 계산을 강제로 수행
- 쓰기와 읽기가 섞이면 매번 레이아웃이 발생 → **레이아웃 스래싱(Layout Thrashing)**

---

## 3. 케이스 비교

### A. 쓰기만 있는 경우

```js
for (let i = 0; i < 1000; i++) {
  box.style.left = `${i}px`;
}
```

- 브라우저가 중간 과정 생략 → 최종 값(`999px`)만 반영
- 성능 부담 적음 (batch 처리)

### B. 쓰기 + 읽기 혼합

```js
for (let i = 0; i < 1000; i++) {
  box.style.left = `${i}px`; // 쓰기
  console.log(box.offsetHeight); // 읽기 → 강제 Reflow
}
```

- 매번 레이아웃 계산 발생 → 1000번 Reflow → 성능 급락

---

## 4. 최적화 방법

- **읽기와 쓰기 분리**

  - 읽기 작업을 모두 모은 뒤, 쓰기 작업을 모아 실행

- **transform 사용**

  - `left` 대신 `transform: translateX(...)` 적용 → 레이아웃이 아니라 컴포지트 단계에서 처리

- **requestAnimationFrame 사용**

  - 프레임마다 한 번씩 업데이트해 브라우저 렌더링 사이클에 맞춤

- **CSS Transition/Animation 활용**

  - 브라우저의 최적화 엔진에 애니메이션을 위임

- **will-change 힌트**

  - 빈번한 변화 속성에 대해 레이어 승격 유도 (과도 사용은 주의)

---

## 5. 핵심 요약

- 쓰기만 있을 땐 batch 최적화 → 최종 값만 반영
- 쓰기+읽기 섞이면 강제 Reflow가 매번 발생 → 성능 저하
- 해결책: **읽기/쓰기 분리**, **transform 사용**, **rAF 또는 CSS 애니메이션 활용**
