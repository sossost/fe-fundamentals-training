# Next.js(App Router) fetch 캐싱 & 재검증

## 1. 캐시와 deduping 구분

- **Request Memoization (deduping)**  
  같은 SSR 렌더 사이클 내에서 동일한 `fetch(url, init)`은 네트워크 요청 1회로 합쳐짐  
  cache 옵션과 무관하게 항상 적용됨
- **Data Cache**  
  `next.revalidate` 기반으로 요청 간(fetch 사이클 간) 응답을 캐싱  
  ISR/PPR 등 정적·부분 정적 렌더링에 활용
- **Full Route Cache**  
  라우트 전체의 HTML + RSC 결과를 캐싱  
  데이터가 바뀌어도 캐시가 유효하면 렌더 없이 서빙됨
- **Router Cache (클라이언트)**  
  브라우저 메모리에 RSC payload와 프리페치 결과를 보관  
  빠른 탐색 전환용, 서버 캐시와는 별개

---

## 2. fetch cache 옵션

### `"force-cache"` (기본값)

- Data Cache에 저장하고 재사용
- 동일 요청은 캐시 응답 반환
- 정적 자원(JS, CSS, 이미지)에 적합

### `"no-store"`

- Data Cache를 쓰지 않고 매 요청마다 원 서버 호출
- SSR 사이클 내 중복은 deduping으로 합쳐짐
- 항상 최신이 필요한 API 응답에 적합

### `"no-cache"`

- 서버에 조건부 요청(ETag, Last-Modified) 전송
- 변경 없으면 304 → 캐시 응답 재사용
- 변경 있으면 새 응답 수신 + 캐시 갱신
- 검증 캐시 전략에 해당

---

## 3. next 옵션

### `next: { revalidate: N }`

- Data Cache 유효시간 설정 (초 단위)
- N초 내 동일 요청은 캐시 응답 반환
- 만료 후 첫 요청 시 새 데이터로 갱신 (ISR)

### `next: { tags: ['tag'] }`

- 해당 fetch 결과를 태그 기반으로 캐싱
- `revalidateTag('tag')` 호출 시 무효화

---

## 4. 무효화 API

- `revalidatePath('/posts')`  
  → 해당 경로의 Data Cache와 Full Route Cache 무효화
- `revalidateTag('posts')`  
  → 해당 태그에 연결된 Data Cache 무효화
- `revalidatePath`/`revalidateTag`는 서버 액션이나 API Route에서 호출 가능

---

## 5. 캐시 옵션 + revalidate 조합 주의

- `no-store` + `revalidate` → 무효 (캐시 자체가 없으므로 재검증 불가)
- `no-cache` + `revalidate` → 조건부 요청 + 유효시간 초과 시 강제 갱신 패턴 가능
- `force-cache` + `revalidate` → 캐시 재사용 + 유효시간 만료 시 갱신

---

## 6. 요약

- **Deduping**: 한 번의 렌더 사이클 내 중복 제거
- 클라이언트 `useEffect` fetch나 API Route 경유 호출은 SSR deduping과 별개 컨텍스트라 공유되지 않음
- **Data Cache**: 요청 간 응답 캐싱 (revalidate/태그/경로로 제어)
- **Full Route Cache**: 렌더 결과 캐싱
- **Router Cache**: 클라이언트 탐색 가속
- 옵션: `force-cache`, `no-store`, `no-cache` + `next.revalidate`/`tags`
