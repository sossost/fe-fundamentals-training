# 🚀 FE 기본기 트레이닝

프론트엔드 개발자로서 알아야 할 핵심 개념과 패턴을 정리한 학습 저장소입니다.

## 📚 목차

- [Browser](#-browser)
- [JavaScript](#-javascript)
- [Network](#-network)
- [React](#-react)
- [Next.js](#-nextjs)
- [Accessibility](#-accessibility)
- [Performance](#-performance)

---

## 🌐 Browser

브라우저 동작 원리와 성능 최적화에 대한 학습 자료입니다.

| 주제                                                        | 설명                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| [렌더링 파이프라인](./topics/browser/rendering-pipeline.md) | Critical Rendering Path, DOM/CSSOM 구성, Layout/Paint/Composite |
| [레이아웃 스래싱](./topics/browser/layout-thrashing.md)     | 강제 동기 레이아웃 문제와 해결 방법                             |
| [브라우저 스토리지](./topics/browser/store.md)              | LocalStorage, SessionStorage, IndexedDB, Cookie 비교            |

---

## 📜 JavaScript

JavaScript 핵심 개념과 동작 원리입니다.

| 주제                                             | 설명                                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| [이벤트 루프](./topics/js/event-loop.md)         | Call Stack, Task Queue, Microtask Queue, 비동기 처리 |
| [동등 연산자](./topics/js/equality-operators.md) | `==` vs `===`, 타입 강제 변환                        |

---

## 🌍 Network

네트워크와 웹 통신에 대한 학습 자료입니다.

| 주제                                                               | 설명                                      |
| ------------------------------------------------------------------ | ----------------------------------------- |
| [HTTPS 요청 과정](./topics/network/https-request.md)               | DNS, TCP, TLS Handshake, HTTP 요청/응답   |
| [HTTP/3](./topics/network/http3.md)                                | QUIC 프로토콜, HTTP/2와의 차이점          |
| [캐시](./topics/network/cache.md)                                  | Cache-Control, ETag, 캐시 전략            |
| [CORS & Preflight](./topics/network/cors-preflight.md)             | 동일 출처 정책, CORS 헤더, Preflight 요청 |
| [CORS & SameSite Cookie](./topics/network/cors-samesite-cookie.md) | 쿠키 보안, SameSite 속성                  |

---

## ⚛️ React

React 패턴과 최적화 기법입니다.

### 📖 개념 문서

| 주제                                                   | 설명                                  |
| ------------------------------------------------------ | ------------------------------------- |
| [참조 안정성](./topics/react/referential-stability.md) | useMemo, useCallback, React.memo 활용 |

### 💻 실습 프로젝트

| 프로젝트                                                            | 설명                    | 주요 학습                                    |
| ------------------------------------------------------------------- | ----------------------- | -------------------------------------------- |
| [Error Boundary](./topics/react/error-boundary/)                    | 에러 경계 컴포넌트 구현 | ErrorBoundary, 에러 처리 전략, AsyncBoundary |
| [리스트 렌더링 최적화](./topics/react/list-rendering-optimization/) | 대용량 리스트 최적화    | React.memo, key 최적화, 가상화               |
| [검색 자동완성](./topics/react/search-autocomplete/)                | Combobox 패턴 구현      | Debounce, API 호출 최적화, 접근성            |
| [드래그앤드롭 업로더](./topics/react/dnd-uploader/)                 | 파일 업로드 구현        | 업로드 큐, 진행률 표시, 에러 처리            |

---

## ▲ Next.js

Next.js 관련 학습 자료입니다.

| 주제                                                   | 설명                                   |
| ------------------------------------------------------ | -------------------------------------- |
| [캐시 & Revalidate](./topics/next/cache-revalidate.md) | ISR, On-demand Revalidation, 캐시 전략 |

---

## ♿ Accessibility

웹 접근성과 웹 표준에 대한 학습 자료입니다.

| 주제                                                                        | 설명                    | 핵심 내용                                    |
| --------------------------------------------------------------------------- | ----------------------- | -------------------------------------------- |
| [시맨틱 HTML](./topics/accessibility/semantic-html.md)                      | 의미 있는 HTML 마크업   | 랜드마크, 제목 계층, button vs div           |
| [ARIA](./topics/accessibility/aria-basics.md)                               | 접근성 향상 속성        | role, aria-label, aria-live, 상태 속성       |
| [키보드 접근성](./topics/accessibility/keyboard-navigation.md)              | 키보드 네비게이션       | tabindex, 포커스 관리, 포커스 트랩           |
| [폼 접근성](./topics/accessibility/form-accessibility.md)                   | 접근성 있는 폼          | label 연결, 에러 처리, autocomplete          |
| [색상과 대비](./topics/accessibility/color-contrast.md)                     | 색상 접근성             | WCAG 대비 기준, 다크모드, 고대비             |
| [이미지 접근성](./topics/accessibility/image-accessibility.md)              | 이미지 대체 텍스트      | alt 작성법, SVG, 아이콘 처리                 |
| [React 컴포넌트 패턴](./topics/accessibility/react-a11y-patterns.md)        | 접근성 있는 UI 컴포넌트 | 모달, 드롭다운, 탭, 아코디언, 콤보박스 등    |
| [스크린 리더 호환성](./topics/accessibility/screen-reader-compatibility.md) | 스크린 리더 사용법      | VoiceOver, NVDA 테스트, 라이브 리전, sr-only |

---

## ⚡ Performance

웹 성능 최적화 기법입니다.

| 주제                                                            | 설명               | 핵심 내용                              |
| --------------------------------------------------------------- | ------------------ | -------------------------------------- |
| [번들 크기 최적화](./topics/performance/bundle-optimization.md) | 번들 최적화        | 코드 스플리팅, 트리 쉐이킹, 압축       |
| [이미지 최적화](./topics/performance/image-optimization.md)     | 이미지 성능 최적화 | WebP/AVIF, lazy loading, 반응형 이미지 |
| [Core Web Vitals](./topics/performance/core-web-vitals.md)      | 핵심 웹 지표       | LCP, INP, CLS 최적화                   |

## 📖 참고 자료

- [MDN Web Docs](https://developer.mozilla.org/)
- [web.dev](https://web.dev/)
- [W3C WAI](https://www.w3.org/WAI/)
- [React 공식 문서](https://react.dev/)
- [Next.js 공식 문서](https://nextjs.org/docs)
