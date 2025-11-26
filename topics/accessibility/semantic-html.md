# 시맨틱 HTML (Semantic HTML)

## 개요

시맨틱 HTML은 콘텐츠의 **의미**를 명확하게 전달하는 HTML 마크업을 말합니다. 단순히 시각적 스타일링이 아닌, 콘텐츠의 구조와 의미를 브라우저, 검색 엔진, 스크린 리더 등에게 전달합니다.

## 왜 중요한가?

### 1. 접근성 (Accessibility)

- 스크린 리더가 페이지 구조를 이해하고 사용자에게 전달
- 키보드 사용자가 페이지를 효율적으로 탐색 가능
- 장애인 사용자도 동등하게 콘텐츠 접근 가능

### 2. SEO (검색 엔진 최적화)

- 검색 엔진이 콘텐츠의 중요도와 구조를 파악
- 더 정확한 검색 결과 노출

### 3. 유지보수성

- 코드의 가독성 향상
- 다른 개발자가 구조를 쉽게 이해

---

## 레이아웃 시맨틱 요소

### 페이지 구조 요소

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>시맨틱 HTML 예제</title>
  </head>
  <body>
    <header>
      <nav>
        <ul>
          <li><a href="/">홈</a></li>
          <li><a href="/about">소개</a></li>
          <li><a href="/contact">연락처</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <article>
        <h1>메인 콘텐츠 제목</h1>
        <section>
          <h2>섹션 1</h2>
          <p>섹션 1의 내용...</p>
        </section>
        <section>
          <h2>섹션 2</h2>
          <p>섹션 2의 내용...</p>
        </section>
      </article>

      <aside>
        <h2>관련 링크</h2>
        <ul>
          <li><a href="#">관련 글 1</a></li>
          <li><a href="#">관련 글 2</a></li>
        </ul>
      </aside>
    </main>

    <footer>
      <p>&copy; 2024 My Website</p>
    </footer>
  </body>
</html>
```

### 각 요소의 역할

| 요소        | 역할                                      | 스크린 리더 동작                |
| ----------- | ----------------------------------------- | ------------------------------- |
| `<header>`  | 페이지/섹션의 헤더                        | "banner" 랜드마크로 인식        |
| `<nav>`     | 네비게이션 링크 그룹                      | "navigation" 랜드마크로 인식    |
| `<main>`    | 페이지의 주요 콘텐츠 (1개만 존재)         | "main" 랜드마크로 인식          |
| `<article>` | 독립적인 콘텐츠 (블로그 글, 뉴스 기사 등) | "article" 랜드마크로 인식       |
| `<section>` | 주제별 콘텐츠 그룹                        | "region" 랜드마크 (제목 필요)   |
| `<aside>`   | 부가 콘텐츠 (사이드바, 관련 링크 등)      | "complementary" 랜드마크로 인식 |
| `<footer>`  | 페이지/섹션의 푸터                        | "contentinfo" 랜드마크로 인식   |

---

## 제목 태그 계층 구조 (Heading Hierarchy)

### ❌ 잘못된 예

```html
<!-- 계층 구조 무시 -->
<h1>웹사이트 제목</h1>
<h3>첫 번째 섹션</h3>
<!-- h2를 건너뜀! -->
<h5>하위 내용</h5>
<!-- h4를 건너뜀! -->

<!-- 스타일링 목적으로 사용 -->
<h6>작은 글씨로 보이게 하고 싶어서 h6 사용</h6>
```

### ✅ 올바른 예

```html
<h1>웹사이트 제목</h1>
<h2>첫 번째 섹션</h2>
<h3>하위 주제 1</h3>
<h3>하위 주제 2</h3>
<h2>두 번째 섹션</h2>
<h3>하위 주제</h3>
<h4>더 세부적인 주제</h4>
```

### 제목 계층 규칙

1. **h1은 페이지당 1개만** (주요 제목)
2. **순서대로 사용** (h1 → h2 → h3, h2 건너뛰고 h3 사용 금지)
3. **스타일링은 CSS로** (제목 레벨은 의미에 맞게)

```css
/* 스타일은 CSS로 분리 */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
}
```

```html
<h2 class="section-title">섹션 제목</h2>
```

---

## 텍스트 시맨틱 요소

### 강조 요소

```html
<!-- 중요도 강조 (스크린 리더가 강조해서 읽음) -->
<strong>매우 중요한 경고 메시지</strong>

<!-- 문맥상 강조 (스크린 리더가 어조 변경) -->
<em>이 부분을 강조합니다</em>

<!-- ❌ 시각적 볼드/이탤릭만을 위한 잘못된 사용 -->
<b>그냥 굵게</b>
<i>그냥 기울임</i>
```

### b, i 태그는 언제 사용?

```html
<!-- <b>: 주의를 끌기 위한 텍스트 (중요도와 무관) -->
<p>제품명: <b>Galaxy S24</b></p>

<!-- <i>: 다른 어조/분위기의 텍스트 -->
<p>그녀는 <i>je ne sais quoi</i>라고 말했다.</p>
```

### 기타 텍스트 시맨틱 요소

```html
<!-- 약어 -->
<abbr title="HyperText Markup Language">HTML</abbr>

<!-- 인용문 -->
<blockquote cite="https://example.com">
  <p>인용된 텍스트입니다.</p>
</blockquote>

<!-- 짧은 인라인 인용 -->
<p>그는 <q>안녕하세요</q>라고 말했다.</p>

<!-- 코드 -->
<code>console.log('Hello')</code>

<!-- 키보드 입력 -->
<p><kbd>Ctrl</kbd> + <kbd>C</kbd>를 누르세요.</p>

<!-- 시간/날짜 -->
<time datetime="2024-01-15">2024년 1월 15일</time>

<!-- 삭제된 텍스트 / 추가된 텍스트 -->
<del>기존 가격: 50,000원</del>
<ins>할인 가격: 35,000원</ins>

<!-- 하이라이트 -->
<p>검색 결과: <mark>JavaScript</mark>가 포함된 문서</p>
```

---

## 인터랙티브 요소: button vs div

### ❌ 안티패턴: div를 버튼처럼 사용

```html
<div class="button" onclick="handleClick()">클릭하세요</div>
```

**문제점:**

- 키보드로 접근 불가 (Tab으로 포커스 안 됨)
- Enter/Space 키로 클릭 불가
- 스크린 리더가 버튼으로 인식 못함
- 포커스 스타일 없음

### ✅ 올바른 방법: 네이티브 button 사용

```html
<button type="button" onclick="handleClick()">클릭하세요</button>
```

**네이티브 button의 장점:**

- 키보드 접근 가능 (Tab으로 포커스)
- Enter/Space 키로 클릭 가능
- 스크린 리더가 "버튼"으로 인식
- 기본 포커스 스타일 제공
- `disabled` 속성 사용 가능

### div를 버튼으로 만들려면? (비권장)

```html
<!-- 접근성을 위해 필요한 모든 것들 -->
<div
  role="button"
  tabindex="0"
  onclick="handleClick()"
  onkeydown="if(event.key === 'Enter' || event.key === ' ') handleClick()"
  aria-disabled="false"
>
  클릭하세요
</div>
```

> ⚠️ 이렇게 복잡하게 만들 바에 그냥 `<button>`을 사용하세요!

---

## 리스트 마크업

### 순서 없는 리스트

```html
<ul>
  <li>항목 1</li>
  <li>항목 2</li>
  <li>항목 3</li>
</ul>
```

### 순서 있는 리스트

```html
<ol>
  <li>첫 번째 단계</li>
  <li>두 번째 단계</li>
  <li>세 번째 단계</li>
</ol>
```

### 설명 리스트 (Definition List)

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language의 약자로, 웹 페이지 구조를 정의합니다.</dd>

  <dt>CSS</dt>
  <dd>Cascading Style Sheets의 약자로, 웹 페이지 스타일을 정의합니다.</dd>
</dl>
```

### ❌ 잘못된 리스트 사용

```html
<!-- div로 리스트 흉내내기 -->
<div class="list">
  <div class="list-item">• 항목 1</div>
  <div class="list-item">• 항목 2</div>
</div>
```

---

## 테이블 마크업

### ❌ 잘못된 테이블

```html
<table>
  <tr>
    <td>이름</td>
    <td>나이</td>
    <td>직업</td>
  </tr>
  <tr>
    <td>홍길동</td>
    <td>30</td>
    <td>개발자</td>
  </tr>
</table>
```

### ✅ 올바른 테이블

```html
<table>
  <caption>
    직원 정보
  </caption>
  <thead>
    <tr>
      <th scope="col">이름</th>
      <th scope="col">나이</th>
      <th scope="col">직업</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>홍길동</td>
      <td>30</td>
      <td>개발자</td>
    </tr>
    <tr>
      <td>김철수</td>
      <td>25</td>
      <td>디자이너</td>
    </tr>
  </tbody>
</table>
```

### 테이블 요소 설명

| 요소          | 역할                                       |
| ------------- | ------------------------------------------ |
| `<caption>`   | 테이블 제목 (스크린 리더가 먼저 읽음)      |
| `<thead>`     | 테이블 헤더 그룹                           |
| `<tbody>`     | 테이블 본문 그룹                           |
| `<tfoot>`     | 테이블 푸터 그룹                           |
| `<th>`        | 헤더 셀 (스크린 리더가 각 셀 읽을 때 참조) |
| `scope="col"` | 이 헤더가 열(column)에 적용됨을 명시       |
| `scope="row"` | 이 헤더가 행(row)에 적용됨을 명시          |

---

## figure와 figcaption

### 이미지에 캡션 추가

```html
<figure>
  <img src="chart.png" alt="2024년 월별 매출 추이를 보여주는 막대 그래프" />
  <figcaption>그림 1: 2024년 월별 매출 현황</figcaption>
</figure>
```

### 코드 블록에 캡션 추가

```html
<figure>
  <pre><code>
const greeting = "Hello, World!";
console.log(greeting);
  </code></pre>
  <figcaption>예제 1: JavaScript 기본 문법</figcaption>
</figure>
```

---

## React에서의 시맨틱 HTML

### ❌ div 남발

```tsx
const Card = ({ title, content }) => (
  <div className="card">
    <div className="card-header">
      <div className="card-title">{title}</div>
    </div>
    <div className="card-body">
      <div className="card-content">{content}</div>
    </div>
  </div>
);
```

### ✅ 시맨틱 요소 활용

```tsx
const Card = ({ title, content }) => (
  <article className="card">
    <header className="card-header">
      <h2 className="card-title">{title}</h2>
    </header>
    <section className="card-body">
      <p className="card-content">{content}</p>
    </section>
  </article>
);
```

### Fragment 대신 시맨틱 요소

```tsx
// ❌ Fragment 남용
const Navigation = () => (
  <>
    <a href="/">홈</a>
    <a href="/about">소개</a>
  </>
);

// ✅ 시맨틱 nav 사용
const Navigation = () => (
  <nav aria-label="메인 네비게이션">
    <a href="/">홈</a>
    <a href="/about">소개</a>
  </nav>
);
```

---

## 체크리스트

프론트엔드 개발 시 확인해야 할 시맨틱 HTML 체크리스트:

- [ ] 페이지에 `<main>` 요소가 1개 존재하는가?
- [ ] `<header>`, `<nav>`, `<footer>` 등 랜드마크 요소를 사용했는가?
- [ ] 제목 태그(h1-h6)가 순서대로 사용되었는가?
- [ ] 페이지당 `<h1>`이 1개인가?
- [ ] 버튼은 `<button>` 요소를 사용했는가?
- [ ] 링크는 `<a>` 요소를 사용했는가?
- [ ] 리스트는 `<ul>`, `<ol>`, `<dl>`을 사용했는가?
- [ ] 테이블에 `<caption>`, `<th>`, `scope` 속성을 사용했는가?
- [ ] 이미지에 적절한 `alt` 텍스트가 있는가?
- [ ] `<html lang="ko">` 언어 속성이 설정되어 있는가?

---

## 참고 자료

- [MDN - HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [W3C - Using HTML sections and outlines](https://www.w3.org/WAI/tutorials/page-structure/)
- [WebAIM - Semantic Structure](https://webaim.org/techniques/semanticstructure/)
