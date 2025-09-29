# 참조 안정화

> **참조 안정화(referential stability)** 는 “같은 의미의 값이라면 렌더마다 **동일한 참조(===)** 를 유지하도록 만들어, 불필요한 리렌더를 막는” 기법. <br/>`React.memo`/`useMemo`/`useCallback`/`useRef` 를 **언제·왜·어떻게** 쓰는지가 핵심

---

# 🧠 왜 필요한가?

- React는 `props` 얕은 비교를 많이 사용합니다(`React.memo`, keying, 의존성 배열 등).
- **객체/배열/함수**는 내용이 같아도 매 렌더마다 **새 참조**가 되기 쉬움 → `memo`가 있어도 **리렌더 발생**.

---

# 🔧 도구별 역할

## 1) `React.memo`

- 자식이 받는 `props`가 얕은 비교로 같으면 리렌더를 스킵.
- 단, **함수/객체/배열**이 매번 새로 만들어지면 무용지물 → 아래 메모화로 참조를 고정해야 함.
- 필요 시 커스텀 비교로 특정 필드만 비교 가능:

  ```tsx
  const Child = React.memo(ChildImpl, (prev, next) => prev.id === next.id);
  ```

## 2) `useCallback`

- **이벤트 핸들러** 등 함수를 안정화.
- 의존성(deps)이 변할 때만 새 함수 생성.

  ```tsx
  const onSelect = useCallback(
    (id: string) => {
      // state/props 참조 → deps에 넣어야 최신 값 보장
    },
    [
      /* deps */
    ]
  );
  ```

- **실수**: deps를 비우면(`[]`) 최신 값이 아닌 **stale closure**가 됨. 반대로 불필요한 deps를 넣으면 매번 새 참조가 됨.
  → “필요한 것만, 정확히” 넣기.

## 3) `useMemo`

- **객체/배열/파생 값**을 안정화.

  ```tsx
  const style = useMemo(() => ({ padding: 8, color }), [color]);
  const columns = useMemo(() => buildColumns(role), [role]);
  ```

- 값 자체는 가볍지만 “참조가 바뀌면 리렌더를 유발하는 상황”에서만 사용 (남용 금지).

## 4) `useRef`

- “참조가 절대 안 바뀌어야 하는” 값을 보관. 렌더 사이에 같은 ref.current 유지.

  ```tsx
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  ```

- **안정 ID / 외부 인스턴스 / mutable 핸들** 등에 유용. 렌더 트리거하지 않음.

---

# ✅ 실전 패턴 & 안티패턴

## A. JSX 인라인 생성물 줄이기

**문제**

```tsx
<Child onClick={() => doSomething(id)} data={{ a: 1 }} list={[1, 2, 3]} />
```

- 매 렌더마다 **새 함수/객체/배열** → `memo` 무력화.

**개선**

```tsx
const onClick = useCallback(() => doSomething(id), [id]);
const data = useMemo(() => ({ a: 1 }), []);
const list = useMemo(() => [1, 2, 3], []);
<Child onClick={onClick} data={data} list={list} />;
```

## B. “원시값으로 쪼개서 전달”

- 자식에 큰 객체를 통으로 넘기지 말고, **필요한 원시 필드**로 쪼개 전달 → 얕은 비교에 유리.

```tsx
// before
<Profile user={user} />

// after
<Profile name={user.name} avatarUrl={user.avatarUrl} />
```

## C. 콜백에 데이터 “담아 보내기” vs “파라미터로 넘기기”

- 불필요한 클로저를 줄이려면 “**인자를 받는 고정 콜백**”으로 처리.

```tsx
// before: 각 아이템마다 새 함수
items.map((item) => <Row onClick={() => onSelect(item.id)} />);

// after: 고정 콜백 + 파라미터
const handleSelect = useCallback((id: string) => onSelect(id), [onSelect]);
items.map((item) => <Row onClick={handleSelect} id={item.id} />);
```

## D. React Native 스타일 최적화

- `style={{ ... }}` 인라인은 매번 새 객체. **`StyleSheet.create`** + 필요 시 `useMemo`:

```tsx
const dynamicStyle = useMemo(() => ({ opacity: enabled ? 1 : 0.5 }), [enabled]);
<View style={[styles.base, dynamicStyle]} />;
```

## E. 상태 설계로 부모 리렌더 줄이기

- 상태를 **필요한 컴포넌트 수준으로 내리기**(state colocation).
- Context는 전파가 큼 → **selector 패턴**(예: `use-context-selector`)이나 **분할 컨텍스트**로 최소화.

## F. TanStack Query 등 외부 훅 결과

- `useQuery` 결과는 객체 참조가 자주 바뀜.
  → `select` 옵션으로 **필요 필드만 원시값으로 가져오기**, 또는 `useMemo`로 파생값 안정화.

```ts
const { data: userName } = useQuery({
  queryKey: ["user"],
  queryFn,
  select: (d) => d.name,
});
```

---

# 🔍 흔한 함정

- **StrictMode 이중 호출(Dev 전용)**: 개발에서 콜백이 두 번 만들어져도 **프로덕션에서는 1회**. 현상과 원인 구분.
- **무분별한 메모화**: 렌더보다 메모화 비용이 더 큰 경우도 많음. **프로파일링**으로 확인 후 적용.
- **잘못된 deps**: 린터 경고 무시 금지. stale bug의 주요 원인.

---

# 📏 언제 적용하나? (체크리스트)

- 자식이 `React.memo`인데도 계속 리렌더된다.
- props에 **함수/객체/배열**을 넘긴다.
- 리스트 뷰/테이블/차트처럼 **자식 수가 많고 무겁다.**
- 분석 도구(React Profiler, why-did-you-render)에서 **렌더 원인**이 “props changed (by ref)” 로 뜬다.

---

# 🧪 빠른 진단 팁

- 자식 첫 줄에 `console.log('render', props)`를 찍어 **어떤 props 참조가 바뀌는지** 확인.
- Profiler Flamegraph로 **리렌더 체인** 위치를 찾고, 해당 지점의 “함수/객체/배열”을 메모화.
