# CSRF (Cross-Site Request Forgery)

## 개요

CSRF는 사용자가 자신의 의도와 무관하게 악성 사이트를 통해 인증된 웹사이트에 요청을 보내게 하는 공격입니다. 사용자가 로그인한 상태에서 공격자의 링크를 클릭하거나 페이지를 방문하면, 사용자의 권한으로 악의적인 요청이 실행됩니다.

## 왜 위험한가?

- **비밀번호 변경**: 사용자 모르게 비밀번호 변경
- **계정 설정 변경**: 이메일, 프로필 수정
- **금융 거래**: 송금, 결제 등
- **데이터 삭제**: 중요한 데이터 삭제

---

## CSRF 공격 시나리오

### 예시: 비밀번호 변경 공격

1. 사용자가 `bank.com`에 로그인 (세션 쿠키 저장)
2. 공격자가 만든 악성 사이트 `evil.com` 방문
3. 악성 사이트에서 자동으로 `bank.com`에 비밀번호 변경 요청 전송
4. 브라우저가 자동으로 쿠키를 포함하여 요청 전송
5. `bank.com`은 사용자의 세션으로 인식하여 요청 처리

```html
<!-- evil.com의 악성 페이지 -->
<form action="https://bank.com/change-password" method="POST" id="evil-form">
  <input type="hidden" name="newPassword" value="hacker123" />
</form>
<script>
  document.getElementById('evil-form').submit();
</script>
```

---

## 방어 방법

### 1. CSRF Token (가장 일반적)

서버에서 생성한 토큰을 폼에 포함하고, 요청 시 검증

#### 서버 측 (예시: Express)

```js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// 토큰 생성 엔드포인트
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 보호된 라우트
app.post('/change-password', (req, res) => {
  // csrf 미들웨어가 자동으로 검증
  // 토큰이 없거나 일치하지 않으면 403 에러
  const { newPassword } = req.body;
  // 비밀번호 변경 로직
});
```

#### 클라이언트 측 (React)

```tsx
import { useState, useEffect } from 'react';

const ChangePasswordForm = () => {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // 페이지 로드 시 CSRF 토큰 가져오기
    fetch('/csrf-token')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        newPassword: 'newPassword123',
        _csrf: csrfToken, // CSRF 토큰 포함
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      <input type="password" name="newPassword" />
      <button type="submit">비밀번호 변경</button>
    </form>
  );
};
```

### 2. SameSite Cookie

쿠키의 `SameSite` 속성으로 크로스 사이트 요청 시 쿠키 전송 방지

```js
// 서버 측 쿠키 설정
res.cookie('sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // 또는 'lax'
});
```

| 값 | 설명 |
|----|------|
| `strict` | 크로스 사이트 요청에서 쿠키 전송 안 함 (가장 안전) |
| `lax` | GET 요청은 허용, POST 등은 차단 (일반적) |
| `none` | 모든 요청에서 쿠키 전송 (Secure 필수) |

### 3. Double Submit Cookie

쿠키와 폼에 동일한 랜덤 값을 저장하고 비교

```tsx
// 서버에서 쿠키로 토큰 전송
// Set-Cookie: csrf-token=random-value

// 클라이언트에서 폼에 동일한 값 포함
<form>
  <input type="hidden" name="csrf-token" value={getCookie('csrf-token')} />
</form>

// 서버에서 쿠키와 폼의 값이 일치하는지 확인
```

### 4. Referer/Origin 검증

요청의 Referer 또는 Origin 헤더를 확인

```js
// 서버 측 검증
app.post('/change-password', (req, res) => {
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  
  // 허용된 도메인인지 확인
  if (origin && !origin.startsWith('https://bank.com')) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  // 요청 처리
});
```

> **주의**: Referer는 프라이버시 설정으로 차단될 수 있음

### 5. 사용자 확인 (Re-authentication)

중요한 작업 전 비밀번호 재입력 요구

```tsx
const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 현재 비밀번호 확인
    await fetch('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword, // 현재 비밀번호 필수
        newPassword,
      }),
    });
  };
};
```

---

## 프론트엔드에서의 실전 패턴

### 1. Axios 인터셉터로 자동 토큰 추가

```tsx
import axios from 'axios';

// CSRF 토큰 가져오기
let csrfToken = '';

const fetchCsrfToken = async () => {
  const response = await axios.get('/csrf-token');
  csrfToken = response.data.csrfToken;
};

// 요청 인터셉터로 자동 추가
axios.interceptors.request.use((config) => {
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// 초기화
fetchCsrfToken();
```

### 2. React Query와 함께 사용

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// CSRF 토큰 가져오기
const { data: csrfData } = useQuery({
  queryKey: ['csrf-token'],
  queryFn: () => fetch('/csrf-token').then((res) => res.json()),
});

// Mutation에 토큰 포함
const changePasswordMutation = useMutation({
  mutationFn: async (newPassword: string) => {
    return fetch('/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData?.csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });
  },
});
```

---

## GET 요청의 CSRF

### GET 요청도 위험할 수 있음

```html
<!-- 악성 이미지 태그로 GET 요청 실행 -->
<img src="https://bank.com/delete-account?id=123" />

<!-- 또는 스크립트로 -->
<script src="https://bank.com/delete-account?id=123"></script>
```

### 방어 방법

- **중요한 작업은 POST/PUT/DELETE만 사용**
- GET 요청에도 CSRF 토큰 검증 (선택적)
- Idempotent 원칙: GET은 데이터 변경하지 않음

---

## 실전 체크리스트

### 개발 시

- [ ] 모든 상태 변경 요청(POST/PUT/DELETE)에 CSRF 토큰 포함
- [ ] 쿠키에 `SameSite` 속성 설정
- [ ] 중요한 작업(비밀번호 변경, 결제 등)은 재인증 요구
- [ ] Referer/Origin 검증 (보조 수단)

### 코드 리뷰 시

- [ ] CSRF 토큰이 모든 상태 변경 요청에 포함되는지 확인
- [ ] 쿠키 설정이 적절한지 확인 (`httpOnly`, `secure`, `sameSite`)
- [ ] GET 요청으로 데이터 변경하는지 확인

---

## 참고 자료

- [OWASP - CSRF](https://owasp.org/www-community/attacks/csrf)
- [MDN - SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Next.js - CSRF Protection](https://nextjs.org/docs/api-routes/introduction)

