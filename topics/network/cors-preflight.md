# CORS 프리플라이트 정리

## 1. 프리플라이트(Preflight) 개념

- 브라우저가 보안상의 이유로 **특정 요청이 안전한지 먼저 확인**해야 할 때
- 본 요청 전에 **OPTIONS 요청**을 자동으로 전송
- 이 과정을 **프리플라이트 요청**이라고 함

---

## 2. 단순 요청(Simple Request) 조건

- 메서드: `GET`, `POST`, `HEAD`
- `Content-Type`: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`
- 추가적인 커스텀 헤더가 없어야 함

👉 이 조건을 벗어나면 **프리플라이트 발생**

---

## 3. 프리플라이트가 발생하는 경우

- 메서드: `PATCH`, `PUT`, `DELETE` 등
- `Content-Type: application/json`
- `Authorization`, `X-Requested-With` 같은 커스텀 헤더 포함

---

## 4. 프리플라이트 요청/응답 예시

### 요청 (브라우저 → 서버)

```http
OPTIONS /users HTTP/1.1
Origin: https://frontend.example
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: Content-Type, Authorization
```

### 응답 (서버 → 브라우저)

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://frontend.example
Access-Control-Allow-Methods: GET, POST, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

---

## 5. 현대 웹서비스에서의 현실

- 대부분 API 요청은 **JSON 바디 + Authorization 헤더** 사용
- 따라서 **프리플라이트가 거의 항상 발생**
- 하지만 브라우저는 `Access-Control-Max-Age`로 프리플라이트 결과를 캐시
  → 같은 엔드포인트로 반복 요청 시 추가 OPTIONS 요청이 줄어듦

---

## 6. 프리플라이트 줄이는 전략

- **가능하면 단순 요청 조건 활용** (거의 불가능: JSON + 토큰이 기본이므로)
- **`Access-Control-Max-Age` 길게 설정**해 캐싱 활용
- **엔드포인트 최소화**: 불필요하게 여러 도메인/서브도메인 나누지 않기

---

## 7. 요약

- 단순 요청 조건을 충족하지 않으면 프리플라이트 발생
- JSON + 토큰 인증 구조에서는 사실상 항상 발생
- 서버 캐시(`Access-Control-Max-Age`)와 API 설계로 성능 부담 완화 가능
