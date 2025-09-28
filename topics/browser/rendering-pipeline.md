# 브라우저 렌더링 파이프라인

## 전체 흐름

1. DNS 조회 → IP 주소 획득
2. TCP 3-way handshake (+ HTTPS라면 TLS handshake)
3. HTTP 요청 → HTML 수신
4. HTML 파싱 → DOM 트리 생성
5. CSS 파싱 → CSSOM 생성
6. DOM + CSSOM → Render Tree 구성
7. Layout → Paint → Composite → 화면 출력
8. JS 다운로드 & 실행
   - CSR: JS가 DOM 생성
   - SSR: 미리 그려진 HTML에 Hydration

## 키 포인트

- Layout: 각 요소의 위치·크기 계산
- Paint: 픽셀 채우기
- Composite: 레이어 합성 (GPU 관여)

## React 관점

- SSR Hydration: HTML + JS 바인딩
- CSR: 빈 HTML + JS 실행으로 DOM 구성
