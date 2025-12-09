# Content Security Policy (CSP)

## 개요

Content Security Policy는 XSS 공격을 방어하기 위한 보안 메커니즘입니다. HTTP 헤더나 메타 태그를 통해 브라우저에 허용된 리소스 소스만 로드하고 실행하도록 지시합니다.

## 왜 중요한가?

- **XSS 방어**: 인라인 스크립트 실행 차단
- **데이터 유출 방지**: 허용되지 않은 도메인으로 데이터 전송 차단
- **클릭재킹 방어**: iframe 삽입 제한
- **악성 코드 실행 방지**: 신뢰할 수 없는 소스의 스크립트 차단

---

## 기본 구조

```http
Content-Security-Policy: <지시어> <소스>; <지시어> <소스>;
```

### 예시

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
```

---

## 주요 지시어 (Directives)

### 리소스 로드 지시어

| 지시어 | 설명 | 기본값 |
|--------|------|--------|
| `default-src` | 다른 지시어의 기본값 | - |
| `script-src` | JavaScript 실행 허용 소스 | `default-src` |
| `style-src` | CSS 로드 허용 소스 | `default-src` |
| `img-src` | 이미지 로드 허용 소스 | `default-src` |
| `font-src` | 폰트 로드 허용 소스 | `default-src` |
| `connect-src` | fetch, XHR, WebSocket 허용 소스 | `default-src` |
| `media-src` | 비디오/오디오 허용 소스 | `default-src` |
| `object-src` | `<object>`, `<embed>`, `<applet>` 허용 소스 | `default-src` |
| `frame-src` | `<iframe>` 허용 소스 | `default-src` |
| `worker-src` | Web Worker, Shared Worker 허용 소스 | `default-src` |
| `manifest-src` | Web App Manifest 허용 소스 | `default-src` |

### 문서 지시어

| 지시어 | 설명 |
|--------|------|
| `base-uri` | `<base>` 태그의 `href` 허용 값 |
| `form-action` | 폼의 `action` 속성 허용 값 |
| `frame-ancestors` | 이 페이지를 iframe으로 삽입할 수 있는 소스 |

### 기타 지시어

| 지시어 | 설명 |
|--------|------|
| `upgrade-insecure-requests` | HTTP를 HTTPS로 자동 업그레이드 |
| `block-all-mixed-content` | 혼합 콘텐츠(HTTPS 페이지의 HTTP 리소스) 차단 |
| `require-sri-for` | SRI(Subresource Integrity) 필수 |

---

## 소스 값 (Source Values)

### 키워드

| 키워드 | 설명 |
|--------|------|
| `'self'` | 같은 출처(origin)만 허용 |
| `'unsafe-inline'` | 인라인 스크립트/스타일 허용 (위험) |
| `'unsafe-eval'` | `eval()`, `Function()` 등 허용 (위험) |
| `'unsafe-hashes'` | 해시 기반 인라인 스크립트 허용 |
| `'none'` | 모든 소스 차단 |
| `'strict-dynamic'` | 동적으로 로드된 스크립트가 추가 스크립트 로드 허용 |

### URL 패턴

```http
# 특정 도메인
script-src https://cdn.example.com

# 서브도메인 포함
script-src https://*.example.com

# 프로토콜 지정
script-src https:

# 포트 지정
script-src https://example.com:443
```

### 해시 (Hash)

인라인 스크립트를 해시로 허용

```html
<!-- HTML -->
<script>
  console.log('Hello');
</script>
```

```http
# 스크립트의 SHA-256 해시 계산 후
Content-Security-Policy: script-src 'sha256-XYZ123...'
```

### Nonce

일회용 랜덤 값으로 인라인 스크립트 허용

```http
Content-Security-Policy: script-src 'nonce-{랜덤값}'
```

```html
<script nonce="{랜덤값}">
  console.log('Hello');
</script>
```

---

## 실전 설정 예시

### 1. 엄격한 CSP (권장)

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'strict-dynamic' 'nonce-{랜덤값}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com;
  connect-src 'self' https://api.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

### 2. CDN 사용 시

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
```

### 3. Next.js 설정

```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 개발 모드
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

---

## Nonce 기반 CSP 구현

### 서버 측 (예시: Express)

```js
const crypto = require('crypto');

app.use((req, res, next) => {
  // 요청마다 새로운 nonce 생성
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic';`
  );
  
  next();
});
```

### 클라이언트 측 (React)

```tsx
// 서버에서 nonce를 props로 전달
function App({ nonce }: { nonce: string }) {
  return (
    <>
      <script nonce={nonce}>
        {`console.log('Inline script with nonce');`}
      </script>
      <div>Content</div>
    </>
  );
}
```

---

## Hash 기반 CSP

인라인 스크립트의 SHA-256 해시를 계산하여 허용

```bash
# 스크립트 내용의 해시 계산
echo -n "console.log('Hello');" | openssl dgst -sha256 -binary | openssl base64
```

```http
Content-Security-Policy: script-src 'sha256-{계산된해시}'
```

```html
<script>
  console.log('Hello');
</script>
```

---

## CSP 위반 보고 (Reporting)

### report-uri / report-to

```http
Content-Security-Policy: 
  default-src 'self';
  report-uri /csp-report;
  report-to csp-endpoint;
```

```js
// /csp-report 엔드포인트
app.post('/csp-report', (req, res) => {
  const report = req.body;
  console.log('CSP Violation:', report);
  // 로깅 또는 알림
  res.status(204).send();
});
```

### Report-Only 모드

실제로 차단하지 않고 위반만 보고

```http
Content-Security-Policy-Report-Only: 
  default-src 'self';
  script-src 'self';
  report-uri /csp-report;
```

---

## 일반적인 문제와 해결

### 1. 인라인 스크립트 차단

```html
<!-- ❌ CSP에 의해 차단됨 -->
<script>
  console.log('Hello');
</script>
```

**해결:**
- Nonce 사용
- Hash 사용
- 외부 파일로 분리

### 2. 인라인 이벤트 핸들러 차단

```html
<!-- ❌ 차단됨 -->
<button onclick="handleClick()">클릭</button>
```

**해결:**
```tsx
// ✅ addEventListener 사용
<button onClick={handleClick}>클릭</button>
```

### 3. 스타일 인라인 차단

```html
<!-- ❌ 차단될 수 있음 -->
<div style="color: red;">텍스트</div>
```

**해결:**
- `style-src 'unsafe-inline'` 추가 (보안 약화)
- 또는 CSS 클래스 사용

### 4. 외부 리소스 차단

```html
<!-- ❌ CSP에 허용되지 않은 도메인 -->
<img src="https://external.com/image.jpg" />
```

**해결:**
```http
img-src 'self' https://external.com;
```

---

## 실전 체크리스트

### 설정 시

- [ ] `default-src 'self'`로 시작
- [ ] 필요한 리소스만 허용 목록에 추가
- [ ] `'unsafe-inline'`, `'unsafe-eval'` 최소화
- [ ] `frame-src`, `object-src`는 `'none'` 권장
- [ ] `upgrade-insecure-requests` 사용

### 테스트 시

- [ ] 브라우저 콘솔에서 CSP 위반 확인
- [ ] Report-Only 모드로 먼저 테스트
- [ ] 모든 기능이 정상 작동하는지 확인

---

## 참고 자료

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - CSP 정책 검증 도구
- [OWASP - Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

