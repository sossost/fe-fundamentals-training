# CORS와 SameSite 쿠키

## SameSite 동작 방식

- **개념**

  - same-origin: 스킴+호스트+포트 모두 같음 (CORS 기준)
  - same-site: eTLD+1 기준에 **스킴까지 포함**(schemeful same-site). `https://app.example.com` ↔ `https://api.example.com` 은 **same-site**, `http://app.example.com` ↔ `https://app.example.com` 은 **cross-site**
  - 핵심: SameSite는 “이 **요청 맥락**에서 쿠키를 보낼 수 있는가”를 결정

- **Strict**

  - 동일 사이트 요청에서만 전송
  - 외부 사이트 → 내 사이트로 이동하는 경우(링크/리다이렉트 포함)엔 전송 안 함
  - CSRF 방어 강력, 로그인 유지 UX는 가장 빡셈

- **Lax (기본)**

  - 동일 사이트 요청은 전송
  - cross-site 요청 중 **top-level GET navigation**(주소창 입력, 링크 클릭, location.href)만 예외적으로 전송
  - **XHR/fetch, POST, iframe, 이미지/스크립트 서브리소스**에는 전송 안 함
  - SPA에서 `fetch('https://api.example.com')` 같은 cross-site API 호출에는 **쿠키 미전송**

- **None**

  - cross-site 맥락에서도 전송 허용
  - **반드시 `Secure`** 필요(HTTPS 전용). 최신 브라우저 정책
  - CSRF 위험 증가 → 별도 방어(토큰, Origin 검증) 필요

- **예시로 감 잡기**

  | 상황                                                                          | Lax 쿠키 전송?              |
  | ----------------------------------------------------------------------------- | --------------------------- |
  | `https://app.example.com` → **링크 클릭** → `https://api.example.com/profile` | 전송(탑레벨 GET 네비게이션) |
  | `https://app.example.com` → **fetch**(`https://api.example.com/user`)         | 미전송                      |
  | `https://blog.other.com` → **링크 클릭** → `https://app.example.com`          | 전송                        |
  | `https://blog.other.com` → **POST 폼** → `https://app.example.com`            | 미전송                      |

---

## CORS와 쿠키

- **역할 분담**

  - CORS: “이 응답을 **JS에서 읽어도 되는가**”를 통제
  - SameSite/credentials: “이 **요청에 쿠키를 실을 수 있는가**”를 통제
  - 둘 다 만족해야 “쿠키 보내고, 응답을 JS가 읽는”게 가능

- **클라이언트 기본값**

  - `fetch` 기본 `credentials: "same-origin"` → cross-origin 요청엔 **자격증명(쿠키) 미포함**
  - cross-site에 쿠키를 포함하려면 `credentials: "include"` 필요

- **서버 조건**

  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Origin: <정확한 오리진>` (와일드카드 `*` 불가, credentials와 함께 쓰면 차단)
  - 프리플라이트 필요한 경우 메서드/헤더 허용도 설정
    `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`
  - 오리진별 응답 캐시 안전하게 하려면 `Vary: Origin` 권장

- **흐름 정리**

  1. cross-site `fetch` → 기본으론 쿠키 안 붙음
  2. 붙이려면 **클라** `credentials: "include"` + **쿠키**가 그 맥락에서 전송 가능(`SameSite=None` 등)
  3. 응답을 JS가 읽으려면 **서버** CORS 헤더에서 credentials/정확한 Origin 허용

---

## 쿠키 설정 예시와 속성 의미

```http
Set-Cookie: session=abc123; Path=/; Domain=example.com; HttpOnly; Secure; SameSite=None
```

- `Path=/` : 경로 범위
- `Domain=example.com` : 서브도메인까지 전송(`api.example.com` 포함). 생략 시 **호스트 전용 쿠키**(발급 호스트에만 전송)
- `HttpOnly` : JS에서 접근 불가(XSS로 탈취 방지)
- `Secure` : HTTPS에서만 전송
- `SameSite=None` : cross-site 전송 허용(반드시 `Secure` 필요)
- **저장 vs 전송 구분**: 쿠키가 **저장**되어도, 요청 맥락(SameSite 규칙)에 따라 **전송**이 거부될 수 있음

> 추가: 크롬 CHIPS(Partitioned 쿠키) 같은 최신 기능은 써드파티 쿠키를 **파티션 단위로 격리**해 보안/프라이버시를 강화하는 옵션. 필요 시 `Partitioned` 속성 검토

---

## 요약

- SameSite=Lax는 cross-site **API 호출(fetch/XHR/POST)** 에선 쿠키 전송 안 함
- cross-site 세션 유지가 필요하면 **`SameSite=None; Secure`** + **클라 `credentials: "include"`** + **서버 CORS(Allow-Credentials, 정확한 Origin)** 가 한 세트
- CORS 통과 = 쿠키 자동 전송 아님. **CORS**와 **SameSite/credentials**는 각각 별도 조건
- `Access-Control-Allow-Origin: *` 와 credentials는 함께 못 씀
- 스킴 포함 **schemeful same-site** 주의(http↔https만 달라도 cross-site로 간주)
- 보안은 **Strict > Lax > None**. None 사용 시 **CSRF 토큰/Origin 검증** 병행

---
