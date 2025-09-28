# React – Search Autocomplete

검색 자동완성(Autocomplete)을 **접근성 표준(Combobox + Listbox)** 기반으로 구현/정리

## 목표

- Combobox + Listbox **ARIA 패턴**을 준수한 입력/목록 상호작용
- **IME(한글)** 입력 대응, **디바운스**, **요청 취소(AbortController)**, **레이스 컨디션 방지**
- **키보드 내비게이션**(↑/↓/Enter/Escape)과 상태 메시지(**aria-live**) 처리

---

## 폴더 구조

```

search-autocomplete/
├─ src/
│  ├─ Combobox.tsx           # 접근성 기준을 지킨 콤보박스 primitive (데이터 페칭 없음)
│  ├─ Autocomplete.tsx       # IME + 디바운스 + fetch 조합한 기능 컴포넌트
│  ├─ useDebouncedValue.ts   # 디바운스 훅
│  └─ useSearch.ts           # fetcher + AbortController + 상태 관리 훅
└─ README.md
```

---

## 핵심 파일 개요

### `src/Combobox.tsx`

- **역할**: 접근성 패턴(Combobox + Listbox)과 키보드 상호작용을 제공하는 **UI primitive**.
- **특징**

  - `role="combobox"` / `role="listbox"` / `role="option"`
  - `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`
  - **키보드**: ↑/↓(활성 항목 이동), Enter(선택), Esc(닫기)
  - **외부 클릭 닫기** 포함

### `src/Autocomplete.tsx`

- **역할**: `Combobox`에 **IME(한글) 조합 처리**, **디바운스**, **데이터 페칭**을 결합한 **기능 컴포넌트**.
- **특징**

  - `onCompositionStart/End`로 **조합 중 호출 차단**
  - `useDebouncedValue`로 **입력 안정화**
  - `useSearch`로 **AbortController** 기반 **요청 취소 & 레이스 방지**
  - 결과/오류/로딩 상태를 `Combobox`에 전달

### `src/useDebouncedValue.ts`

- **역할**: 값이 일정 시간 동안 변하지 않을 때만 확정하는 단순 디바운스 훅.

### `src/useSearch.ts`

- **역할**: `fetcher(q, signal)`를 받아 상태(`data/loading/error`)를 관리.
- **특징**: `AbortController`로 **이전 요청 취소**, 느린 응답이 뒤늦게 덮어쓰는 **레이스 컨디션 방지**.

---

## 접근성(Accessibility) 요약

- **역할(Role)**

  - 입력: `role="combobox"`
  - 목록: `role="listbox"`
  - 항목: `role="option"`

- **주요 속성**

  - `aria-autocomplete="list"`: 입력값 기반 목록 제안
  - `aria-expanded`: 목록 열림/닫힘 상태
  - `aria-controls`: 입력과 목록 연결
  - `aria-activedescendant`: **활성(하이라이트)** 항목 id (포커스는 input 유지)
  - `aria-selected`(option): 선택/활성 상태 표시
  - 필요 시 `aria-live`(polite/atomic)로 **“검색 중/결과 n개/오류”** 등 상태 알림

> `aria-live`는 시각적으로 숨겨도 됩니다(예: `sr-only` 유틸). 숨김은 필수가 아니며, **시각 사용자에게도 유용한 메시지라면 화면에 노출**

---

## 키보드/마우스 동작

- **ArrowDown / ArrowUp**: 활성 항목 이동
- **Enter**: 활성 항목 선택
- **Escape**: 목록 닫기
- **클릭**: 항목 선택
- **바깥 클릭**: 목록 닫기

---

## IME(한글) 입력 대응

- 조합 중(`onCompositionStart`)에는 네트워크 호출을 막고,
  조합 종료(`onCompositionEnd`) 시점에 **최종 문자열**로 디바운스 → 페칭
- 일부 환경에서 조합 중에도 `onChange`가 연속 발생하므로, **조합 플래그**로 방어

---

## 에러/빈/로딩 상태

- **로딩**: “검색 중…”
- **오류**: `role="alert"`로 즉시 안내 가능
- **빈 결과**: “결과 없음”
- `aria-live="polite" aria-atomic="true"` 영역을 둬 **상태 변화를 읽어주기**

```

```
