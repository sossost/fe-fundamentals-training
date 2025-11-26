# ARIA (Accessible Rich Internet Applications)

## 개요

ARIA는 HTML만으로 표현하기 어려운 동적 콘텐츠와 커스텀 UI 컴포넌트의 접근성을 향상시키기 위한 속성 집합입니다. W3C에서 정의한 명세로, 스크린 리더와 같은 보조 기술에 추가적인 정보를 제공합니다.

## ⚠️ ARIA 사용의 첫 번째 규칙

> **"ARIA를 사용하지 않는 것이 ARIA를 사용하는 것보다 낫다"**

네이티브 HTML 요소가 있다면 그것을 먼저 사용하세요!

```html
<!-- ❌ ARIA로 버튼 흉내내기 -->
<div role="button" tabindex="0">클릭</div>

<!-- ✅ 네이티브 button 사용 -->
<button>클릭</button>
```

### ARIA를 사용해야 할 때

- 네이티브 HTML로 구현할 수 없는 복잡한 위젯 (탭, 아코디언, 트리뷰 등)
- 동적으로 변경되는 콘텐츠를 알려야 할 때
- 시각적으로만 전달되는 정보에 대안을 제공할 때

---

## ARIA 속성의 세 가지 유형

### 1. Roles (역할)

요소의 유형/역할을 정의합니다.

```html
<div role="button">버튼 역할</div>
<div role="alert">경고 메시지</div>
<nav role="navigation">네비게이션</nav>
```

### 2. Properties (속성)

요소의 특성을 정의합니다. 잘 변경되지 않는 정보입니다.

```html
<input aria-label="검색어 입력" />
<div aria-labelledby="title-id">...</div>
<input aria-required="true" />
```

### 3. States (상태)

요소의 현재 상태를 나타냅니다. 동적으로 변경될 수 있습니다.

```html
<button aria-expanded="false">메뉴 열기</button>
<li aria-selected="true">선택된 항목</li>
<input aria-invalid="true" />
```

---

## 라벨링 속성

### aria-label

요소에 직접 라벨 텍스트를 제공합니다.

```html
<!-- 아이콘만 있는 버튼 -->
<button aria-label="검색">
  <svg><!-- 검색 아이콘 --></svg>
</button>

<!-- 여러 개의 "더보기" 링크 구분 -->
<a href="/news" aria-label="뉴스 더보기">더보기</a>
<a href="/blog" aria-label="블로그 더보기">더보기</a>

<!-- 닫기 버튼 -->
<button aria-label="모달 닫기">×</button>
```

### aria-labelledby

다른 요소의 텍스트를 라벨로 참조합니다.

```html
<h2 id="section-title">회원가입</h2>
<form aria-labelledby="section-title">
  <!-- 폼 내용 -->
</form>

<!-- 여러 요소 조합 -->
<span id="billing">청구지</span>
<span id="address">주소</span>
<input aria-labelledby="billing address" />
<!-- 스크린 리더: "청구지 주소" -->
```

### aria-describedby

요소에 대한 추가 설명을 제공합니다.

```html
<label for="password">비밀번호</label>
<input
  type="password"
  id="password"
  aria-describedby="password-hint password-error"
/>
<p id="password-hint">8자 이상, 특수문자 포함</p>
<p id="password-error" role="alert">비밀번호가 너무 짧습니다.</p>

<!-- 스크린 리더: "비밀번호, 8자 이상 특수문자 포함, 비밀번호가 너무 짧습니다" -->
```

### 라벨링 우선순위

스크린 리더가 읽는 우선순위:

1. `aria-labelledby`
2. `aria-label`
3. `<label>` 요소
4. `title` 속성
5. `placeholder` (비권장)

```html
<!-- aria-labelledby가 가장 높은 우선순위 -->
<label for="email">이메일</label>
<input
  id="email"
  aria-label="회사 이메일"
  aria-labelledby="custom-label"
  placeholder="example@email.com"
/>
<span id="custom-label">업무용 이메일 주소</span>
<!-- 스크린 리더: "업무용 이메일 주소" (aria-labelledby 사용) -->
```

---

## role 속성

### 랜드마크 역할 (Landmark Roles)

페이지의 주요 영역을 정의합니다. 시맨틱 HTML과 대응됩니다.

| role | 대응 HTML | 설명 |
|------|-----------|------|
| `banner` | `<header>` (최상위) | 페이지 헤더 |
| `navigation` | `<nav>` | 네비게이션 |
| `main` | `<main>` | 주요 콘텐츠 |
| `complementary` | `<aside>` | 보조 콘텐츠 |
| `contentinfo` | `<footer>` (최상위) | 페이지 푸터 |
| `search` | - | 검색 기능 |
| `form` | `<form>` (이름 있을 때) | 폼 영역 |
| `region` | `<section>` (이름 있을 때) | 중요 영역 |

```html
<!-- 시맨틱 HTML 사용 권장 -->
<nav>...</nav>

<!-- ARIA role은 시맨틱 요소가 없을 때만 -->
<div role="search">
  <input type="search" aria-label="사이트 검색" />
  <button>검색</button>
</div>
```

### 위젯 역할 (Widget Roles)

인터랙티브 컴포넌트의 역할을 정의합니다.

```html
<!-- 탭 인터페이스 -->
<div role="tablist">
  <button role="tab" aria-selected="true">탭 1</button>
  <button role="tab" aria-selected="false">탭 2</button>
</div>
<div role="tabpanel">탭 1 내용</div>

<!-- 다이얼로그 (모달) -->
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">확인</h2>
  <p>정말 삭제하시겠습니까?</p>
</div>

<!-- 경고 메시지 -->
<div role="alert">저장되었습니다!</div>

<!-- 알림 (덜 긴급한 메시지) -->
<div role="status">3개의 새 메시지</div>

<!-- 메뉴 -->
<ul role="menu">
  <li role="menuitem">복사</li>
  <li role="menuitem">붙여넣기</li>
</ul>
```

### 구조 역할 (Document Structure Roles)

```html
<!-- 리스트 -->
<div role="list">
  <div role="listitem">항목 1</div>
  <div role="listitem">항목 2</div>
</div>

<!-- 그룹 -->
<div role="group" aria-label="텍스트 서식">
  <button>굵게</button>
  <button>기울임</button>
</div>

<!-- 프레젠테이션 (의미 제거) -->
<table role="presentation">
  <!-- 레이아웃 목적의 테이블 -->
</table>
```

---

## 상태 속성

### aria-expanded

접힌/펼쳐진 상태를 나타냅니다.

```html
<!-- 드롭다운 메뉴 -->
<button aria-expanded="false" aria-controls="menu">
  메뉴 열기
</button>
<ul id="menu" hidden>
  <li>항목 1</li>
  <li>항목 2</li>
</ul>
```

```tsx
// React 예시
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button
      aria-expanded={isOpen}
      aria-controls="dropdown-menu"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? '닫기' : '열기'}
    </button>
    {isOpen && (
      <ul id="dropdown-menu">
        <li>옵션 1</li>
        <li>옵션 2</li>
      </ul>
    )}
  </>
);
```

### aria-selected

선택된 항목을 나타냅니다.

```html
<!-- 탭 -->
<div role="tablist">
  <button role="tab" aria-selected="true">탭 1</button>
  <button role="tab" aria-selected="false">탭 2</button>
</div>

<!-- 리스트박스 -->
<ul role="listbox">
  <li role="option" aria-selected="true">옵션 1</li>
  <li role="option" aria-selected="false">옵션 2</li>
</ul>
```

### aria-checked

체크 상태를 나타냅니다.

```html
<!-- 커스텀 체크박스 -->
<div role="checkbox" aria-checked="true" tabindex="0">
  이용약관 동의
</div>

<!-- 혼합 상태 (부분 선택) -->
<div role="checkbox" aria-checked="mixed" tabindex="0">
  전체 선택
</div>
```

### aria-disabled

비활성화 상태를 나타냅니다.

```html
<!-- 네이티브 disabled와의 차이 -->
<button disabled>포커스 불가</button>
<button aria-disabled="true">포커스 가능하지만 비활성화</button>
```

```tsx
// aria-disabled 사용 시 클릭 방지 필요
<button
  aria-disabled={isLoading}
  onClick={(e) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    handleSubmit();
  }}
>
  {isLoading ? '처리 중...' : '제출'}
</button>
```

### aria-invalid

유효성 검사 실패 상태를 나타냅니다.

```html
<label for="email">이메일</label>
<input
  type="email"
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  올바른 이메일 형식이 아닙니다.
</span>
```

### aria-busy

로딩 중인 상태를 나타냅니다.

```html
<div aria-busy="true" aria-live="polite">
  데이터를 불러오는 중...
</div>
```

### aria-current

현재 위치/상태를 나타냅니다.

```html
<!-- 네비게이션에서 현재 페이지 -->
<nav>
  <a href="/" aria-current="page">홈</a>
  <a href="/about">소개</a>
  <a href="/contact">연락처</a>
</nav>

<!-- 단계 표시 -->
<ol>
  <li>장바구니</li>
  <li aria-current="step">배송정보</li>
  <li>결제</li>
</ol>
```

---

## aria-hidden

### 보조 기술에서 숨기기

시각적으로는 보이지만 스크린 리더에서 숨깁니다.

```html
<!-- 장식용 아이콘 숨기기 -->
<button>
  <span aria-hidden="true">🔍</span>
  검색
</button>

<!-- 장식용 이미지 숨기기 -->
<img src="decorative.png" alt="" aria-hidden="true" />

<!-- 중복 콘텐츠 숨기기 -->
<a href="/profile">
  <img src="avatar.png" alt="" aria-hidden="true" />
  <span>프로필 보기</span>
</a>
```

### ⚠️ 주의사항

```html
<!-- ❌ 포커스 가능한 요소를 숨기면 안 됨 -->
<div aria-hidden="true">
  <button>클릭</button>  <!-- 문제! -->
</div>

<!-- ❌ 중요한 콘텐츠를 숨기면 안 됨 -->
<p aria-hidden="true">중요한 안내 메시지</p>
```

### 모달에서의 aria-hidden

모달이 열릴 때 배경 콘텐츠를 숨깁니다.

```html
<body>
  <div id="app" aria-hidden="true">
    <!-- 모달 뒤의 콘텐츠 -->
  </div>
  
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">모달 제목</h2>
    <!-- 모달 콘텐츠 -->
  </div>
</body>
```

---

## aria-live (라이브 리전)

동적으로 변경되는 콘텐츠를 스크린 리더에 알립니다.

### aria-live="polite"

현재 읽고 있는 것을 마친 후 알림 (권장)

```html
<div aria-live="polite">
  <!-- 변경 시 알림 -->
  검색 결과: 15건
</div>
```

### aria-live="assertive"

즉시 중단하고 알림 (긴급한 경우만)

```html
<div aria-live="assertive" role="alert">
  세션이 만료되었습니다. 다시 로그인해주세요.
</div>
```

### aria-live="off"

알리지 않음 (기본값)

### 실제 사용 예시

```tsx
// 검색 결과 알림
const SearchResults = ({ results }) => {
  return (
    <div>
      <p aria-live="polite" aria-atomic="true">
        {results.length}개의 결과를 찾았습니다.
      </p>
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

```tsx
// 폼 제출 결과 알림
const Form = () => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = async () => {
    try {
      await submitForm();
      setMessage('성공적으로 저장되었습니다.');
    } catch {
      setMessage('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드들 */}
      <div role="status" aria-live="polite">
        {message}
      </div>
    </form>
  );
};
```

### 관련 속성

```html
<!-- aria-atomic: 변경 시 전체/일부 읽기 -->
<div aria-live="polite" aria-atomic="true">
  현재 시간: <span>14:30</span>
</div>
<!-- true: "현재 시간: 14:30" 전체 읽음 -->
<!-- false: "14:30" 변경된 부분만 읽음 -->

<!-- aria-relevant: 어떤 변경을 알릴지 -->
<ul aria-live="polite" aria-relevant="additions removals">
  <!-- additions: 추가된 항목 알림 -->
  <!-- removals: 제거된 항목 알림 -->
  <!-- text: 텍스트 변경 알림 -->
  <!-- all: 모든 변경 알림 -->
</ul>
```

---

## aria-controls & aria-owns

### aria-controls

이 요소가 제어하는 다른 요소를 지정합니다.

```html
<button aria-controls="panel" aria-expanded="false">
  패널 토글
</button>
<div id="panel" hidden>
  패널 내용
</div>
```

### aria-owns

DOM 순서와 다른 소유 관계를 지정합니다.

```html
<!-- DOM 구조상 떨어져 있지만 논리적으로 소유 -->
<div role="listbox" aria-owns="option-1 option-2">
  기본 옵션들
</div>

<!-- 포털로 렌더링된 옵션들 -->
<div id="portal">
  <div id="option-1" role="option">옵션 1</div>
  <div id="option-2" role="option">옵션 2</div>
</div>
```

---

## React에서 ARIA 사용

### 동적 ARIA 상태 관리

```tsx
import { useState } from 'react';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  
  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
      </button>
      
      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-button`}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
};
```

### 커스텀 셀렉트 박스

```tsx
const Select = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  
  return (
    <div>
      <label id={`${listboxId}-label`}>{label}</label>
      <button
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${listboxId}-label`}
        aria-controls={listboxId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || '선택하세요'}
      </button>
      
      {isOpen && (
        <ul id={listboxId} role="listbox" aria-labelledby={`${listboxId}-label`}>
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 로딩 상태 알림

```tsx
const DataList = () => {
  const { data, isLoading, error } = useQuery('items', fetchItems);
  
  return (
    <div>
      {/* 로딩 상태 알림 */}
      <div
        role="status"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading && '데이터를 불러오는 중...'}
      </div>
      
      {/* 에러 알림 */}
      {error && (
        <div role="alert">
          데이터를 불러오는데 실패했습니다.
        </div>
      )}
      
      {/* 데이터 목록 */}
      <ul aria-label="아이템 목록">
        {data?.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 자주 하는 실수

### 1. 불필요한 ARIA 사용

```html
<!-- ❌ 이미 button은 role="button"을 가짐 -->
<button role="button">클릭</button>

<!-- ✅ 그냥 button 사용 -->
<button>클릭</button>
```

### 2. 잘못된 role 사용

```html
<!-- ❌ div에 button role만 주면 키보드 접근 안 됨 -->
<div role="button">클릭</div>

<!-- ✅ tabindex와 키보드 이벤트도 필요 -->
<div role="button" tabindex="0" onkeydown="...">클릭</div>

<!-- ✅ 또는 그냥 button 사용 -->
<button>클릭</button>
```

### 3. aria-label 남용

```html
<!-- ❌ 보이는 텍스트가 있으면 aria-label 불필요 -->
<button aria-label="검색 버튼">검색</button>

<!-- ✅ 보이는 텍스트만으로 충분 -->
<button>검색</button>

<!-- ✅ 아이콘만 있을 때 aria-label 필요 -->
<button aria-label="검색">
  <SearchIcon aria-hidden="true" />
</button>
```

### 4. aria-hidden과 포커스

```html
<!-- ❌ 포커스 가능한 요소가 숨겨짐 -->
<div aria-hidden="true">
  <a href="/page">링크</a>
</div>

<!-- ✅ 포커스도 함께 관리 -->
<div aria-hidden="true" inert>
  <a href="/page">링크</a>
</div>
```

---

## 체크리스트

- [ ] 네이티브 HTML로 구현 가능한가? → ARIA 사용 X
- [ ] aria-label/labelledby로 이름을 제공했는가?
- [ ] 동적 상태(expanded, selected 등)를 업데이트하는가?
- [ ] aria-live로 동적 변경사항을 알리는가?
- [ ] 장식용 요소는 aria-hidden="true"인가?
- [ ] aria-hidden된 영역에 포커스 가능한 요소가 없는가?
- [ ] role 사용 시 필요한 키보드 인터랙션을 구현했는가?

---

## 참고 자료

- [WAI-ARIA 1.2 Specification](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN - ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Using ARIA](https://www.w3.org/TR/using-aria/)

