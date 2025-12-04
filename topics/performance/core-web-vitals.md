# Core Web Vitals

## 개요

Core Web Vitals는 Google이 정의한 웹 페이지 사용자 경험을 측정하는 3가지 핵심 지표입니다. 이 지표들은 실제 사용자가 느끼는 성능과 사용성을 반영하며, SEO 랭킹에도 직접적인 영향을 미칩니다.

## 3가지 핵심 지표 (2024년 기준)

> **Note:** 2024년 3월부터 **INP**가 FID를 공식적으로 대체했습니다.

| 지표    | 설명 (Full Name)          | 좋음 (Good) | 개선 필요 (Needs Imp.) | 나쁨 (Poor) |
| ------- | ------------------------- | ----------- | ---------------------- | ----------- |
| **LCP** | Largest Contentful Paint  | ≤ 2.5초     | 2.5초 \~ 4.0초         | \> 4.0초    |
| **INP** | Interaction to Next Paint | ≤ 200ms     | 200ms \~ 500ms         | \> 500ms    |
| **CLS** | Cumulative Layout Shift   | ≤ 0.1       | 0.1 \~ 0.25            | \> 0.25     |

---

## 1\. LCP (Largest Contentful Paint)

### 정의

페이지가 로드되기 시작한 시점부터 **가장 큰 콘텐츠 요소**가 화면에 완전히 렌더링될 때까지의 시간 (로딩 속도 체감 지표)

### LCP 후보 요소

- `<img>` 요소
- `<video>` 요소 (포스터 이미지)
- CSS `background-image`가 있는 요소
- 텍스트 블록 요소 (`<p>`, `<h1>` 등)

### 최적화 방법

#### 1\. 이미지 최적화 및 우선순위

LCP 요소는 반드시 `lazy loading`을 피하고 `eager`로 로드해야 합니다.

```tsx
// ✅ Next.js Image: priority 속성 사용
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true} // LCP 요소 필수 설정
/>
```

```html
<img src="hero.jpg" alt="Hero" fetchpriority="high" />
```

#### 2\. 리소스 프리로드 (Preload)

브라우저가 HTML을 파싱하기 전에 미리 리소스를 요청합니다.

```html
<link rel="preload" as="image" href="/hero-image.webp" />
<link rel="preload" as="style" href="/critical.css" />
```

#### 3\. 서버 응답 시간 (TTFB) 개선

- CDN(Content Delivery Network) 사용으로 물리적 거리 단축
- 서버 사이드 렌더링(SSR) 시 캐싱 전략(ISR, Cache-Control) 적극 활용
- DB 쿼리 최적화

#### 4\. 렌더링 차단 리소스 제거

CSS와 JS는 렌더링을 차단합니다. 중요하지 않은 CSS는 비동기로 로드합니다.

```html
<link
  rel="preload"
  href="styles.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

---

## 2\. INP (Interaction to Next Paint)

### 정의

사용자가 페이지와 상호작용(클릭, 터치, 키보드)한 시점부터 **다음 프레임이 실제로 그려질 때까지의 전체 소요 시간**입니다.

- **구성 요소:** 입력 지연(Input Delay) + **처리 시간(Processing Time)** + 렌더링 지연(Presentation Delay)
- **FID와의 차이:** FID는 '입력 지연'만 측정했으나, INP는 이벤트 핸들러 실행 시간과 브라우저가 화면을 그리는 시간까지 모두 포함합니다.

### 최적화 방법

#### 1\. 긴 작업(Long Tasks) 분할

메인 스레드가 50ms 이상 차단되면 사용자는 버벅임을 느낍니다. 작업을 잘게 쪼개어 브라우저가 렌더링할 틈을 줘야 합니다.

```js
// ✅ 최신 방법: scheduler.yield() 사용 (Chrome 115+)
async function yieldToMain() {
  if ("scheduler" in window && "yield" in scheduler) {
    await scheduler.yield();
  } else {
    // Fallback
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
}

async function processLargeData(data) {
  for (const item of data) {
    processItem(item);
    // 작업 중간에 메인 스레드 양보
    await yieldToMain();
  }
}
```

#### 2\. 이벤트 핸들러 최적화

이벤트 핸들러 내부 로직을 최소화합니다.

```tsx
// ❌ 무거운 작업 직접 실행
<button
  onClick={() => {
    heavyCalculation(); // UI 멈춤 발생
    setState(result);
  }}
>
  계산
</button>;

// ✅ Web Worker로 위임 (메인 스레드 해방)
const worker = new Worker("worker.js");
<button onClick={() => worker.postMessage(data)}>계산</button>;
```

#### 3\. React 동시성 기능 활용 (useTransition)

상태 업데이트의 우선순위를 낮춰 UI 블로킹을 방지합니다.

```tsx
import { useTransition } from "react";

const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  // 긴급한 업데이트 (입력창 반영)
  setInputValue(e.target.value);

  // 덜 긴급한 업데이트 (필터링, 차트 다시 그리기 등)
  startTransition(() => {
    setFilter(e.target.value);
  });
};
```

---

## 3\. CLS (Cumulative Layout Shift)

### 정의

페이지 로드 중 발생하는 **예상치 못한 레이아웃 이동**의 누적 점수입니다. 시각적 안정성을 측정합니다.

### CLS 계산식

```
CLS 점수 = 영향받은 면적 비율 × 이동 거리 비율
```

### 최적화 방법

#### 1\. 이미지 및 비디오 크기 명시 (Aspect Ratio)

```html
<img src="image.jpg" width="800" height="600" alt="Image" />
```

```css
/* CSS aspect-ratio 속성 활용 */
.embed-container {
  aspect-ratio: 16 / 9;
}
```

#### 2\. 폰트 로딩 최적화 (FOIT/FOUT 방지)

웹 폰트 로딩 중에 텍스트가 안 보이거나(FOIT) 글꼴이 바뀌면서(FOUT) 레이아웃이 흔들리는 것을 방지합니다.

```css
/* ✅ fallback 폰트와 크기를 맞춰서 사용 */
@font-face {
  font-family: "MyFont";
  src: url("font.woff2") format("woff2");
  font-display: swap; /* 즉시 텍스트 표시 */
}
```

#### 3\. 동적 콘텐츠 공간 예약

광고나 배너처럼 나중에 로드되는 요소는 미리 `min-height`를 잡아둡니다.

```tsx
// ✅ Skeleton UI 활용
<div style={{ minHeight: "250px" }}>
  {isLoading ? <Skeleton height={250} /> : <AdComponent />}
</div>
```

---

## 4\. 측정 도구 및 Next.js 설정

### Chrome 확장 프로그램 & 개발자 도구

1.  **Web Vitals Extension**: 브라우저 오버레이로 실시간 점수 확인
2.  **Performance 탭**: CPU 스로틀링을 걸고 Long Task 분석
3.  **Lighthouse**: 실험실 환경(Lab Data) 측정

### Next.js 자동 측정 (App Router 지원)

Next.js는 `useReportWebVitals` 훅을 제공합니다.

```tsx
// app/components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric); // { id, name, startTime, value, label }

    // 예: Google Analytics로 전송
    // if (metric.name === 'FCP') { ... }
  });

  return null;
}

// app/layout.tsx에 포함
import { WebVitals } from "./components/WebVitals";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
```

### PageSpeed Insights

- **URL**: [https://pagespeed.web.dev/](https://pagespeed.web.dev/)
- **특징**: 실제 사용자 데이터(CrUX Report)와 실험실 데이터를 동시에 제공하므로 가장 신뢰도가 높습니다.

---

## 5\. 실전 체크리스트

### LCP (속도)

- [ ] `priority` (Next.js) 또는 `fetchpriority="high"` 적용 확인
- [ ] 이미지 포맷 WebP/AVIF 사용
- [ ] CDN 적용 및 캐싱 정책(Cache-Control) 확인
- [ ] 서버 응답 속도(TTFB)가 0.8초 미만인지 확인

### INP (반응성)

- [ ] `console.time` 등으로 50ms 이상 걸리는 JS 함수 추적
- [ ] 무거운 연산은 `requestIdleCallback`, `scheduler.yield`, 또는 Web Worker로 분리
- [ ] React `useTransition`, `useDeferredValue` 적용 검토
- [ ] 불필요한 `useEffect` 줄이기

### CLS (안정성)

- [ ] 모든 이미지/비디오에 `width`, `height` 속성 존재 확인
- [ ] 웹 폰트 `font-display: swap` 또는 `optional` 적용
- [ ] 동적 배너/광고 영역에 `min-height` 지정
- [ ] 애니메이션은 `transform`과 `opacity` 속성만 사용 (layout shift 발생 안 함)

---

## 참고 자료

- [Web.dev - Interaction to Next Paint (INP)](https://web.dev/inp/)
- [Next.js - Optimizing Images](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Optimize Long Tasks](https://web.dev/optimize-long-tasks/)
- [Google Chrome - Scheduler.yield](https://developer.chrome.com/blog/introducing-scheduler-yield-origin-trial/)
