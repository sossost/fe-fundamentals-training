# 이미지 최적화 (Image Optimization)

## 개요

이미지는 웹 페이지 전체 용량의 대부분을 차지합니다. 적절한 이미지 최적화는 대역폭을 절약하고 로딩 속도를 획기적으로 개선하여 Core Web Vitals 점수와 SEO 순위를 높입니다.

## 왜 중요한가?

- **LCP 개선**: 가장 큰 콘텐츠(주로 이미지)의 로딩 속도 향상
- **대역폭 절약**: 모바일 데이터 사용량 감소 및 서버 비용 절감
- **CLS 방지**: 이미지 크기 지정으로 레이아웃 이동 방지
- **메인 스레드 보호**: 이미지 디코딩 부하 분산

---

## 1\. 이미지 포맷 선택

### 현대적 포맷 비교 (2025년 기준)

| 포맷     | 용도           | 압축률 | 특징 및 브라우저 지원                                |
| :------- | :------------- | :----- | :--------------------------------------------------- |
| **AVIF** | 사진, 그래픽   | 최상   | WebP 대비 20% 더 작음. (Chrome, Firefox, Safari 16+) |
| **WebP** | 사진, 그래픽   | 상     | JPEG 대비 30% 더 작음. (모든 최신 브라우저)          |
| **SVG**  | 아이콘, 로고   | 벡터   | 해상도 무관 선명함. CSS 스타일링 가능.               |
| **JPEG** | 사진           | 중     | 범용성 높음. 투명도 불가.                            |
| **PNG**  | 투명도, 텍스트 | 하     | 무손실 압축. 용량이 큼.                              |

### 포맷 선택 가이드 (`picture` 태그)

브라우저가 지원하는 가장 좋은 포맷을 자동으로 선택하게 합니다.

```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="설명" width="800" height="600" />
</picture>
```

### 디코딩 최적화 (`decoding="async"`)

이미지 디코딩 과정을 메인 스레드가 아닌 별도 스레드에서 처리하여 스크롤 버벅임을 방지합니다.

```html
<img src="image.jpg" decoding="async" alt="비동기 디코딩" />
```

---

## 2\. 이미지 크기 최적화 (Responsive Images)

### `srcset`과 `sizes`

사용자의 디바이스 해상도(DPR)와 뷰포트 크기에 맞는 이미지를 브라우저가 다운로드하도록 합니다.

```html
<img
  src="small.jpg"
  srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="반응형 이미지"
/>
```

### Next.js Image 자동 최적화

Next.js는 `sizes` 속성만 입력하면 `srcset`을 자동으로 생성합니다.

```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  fill // 부모 요소 꽉 채우기
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>;
```

---

## 3\. Lazy Loading (지연 로딩)

### 네이티브 Lazy Loading

최신 브라우저는 속성 하나로 지원합니다. (화면에 보이기 전까지 다운로드 하지 않음)

```html
<img src="image.jpg" loading="lazy" alt="지연 로딩" />
```

### Next.js Image

`priority` 속성이 없는 모든 이미지는 기본적으로 Lazy Loading 됩니다.

```tsx
<Image
  src="/footer-logo.png"
  alt="로고"
  width={200}
  height={100}
  // loading="lazy" 가 기본값
/>
```

---

## 4\. 이미지 압축 자동화

### 온라인 도구 (수동)

- **Squoosh** (Google): 실시간 비교 압축 (가장 추천)
- **TinyPNG**: PNG/JPEG 간편 압축

### Webpack 5 설정 (자동화)

`image-minimizer-webpack-plugin`을 사용하여 빌드 시점에 이미지를 압축합니다.

```js
// webpack.config.js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...", // 기존 JS 미니파이 유지
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["imagemin-mozjpeg", { quality: 75 }],
              ["imagemin-pngquant", { quality: [0.6, 0.8] }],
              ["imagemin-svgo", { plugins: [{ name: "preset-default" }] }],
            ],
          },
        },
      }),
    ],
  },
};
```

---

## 5\. 이미지 CDN 및 Next.js 설정

### CDN 활용 (Cloudinary, Imgix)

URL 파라미터로 실시간 변환/압축을 수행합니다.

```html
<img
  src="https://res.cloudinary.com/demo/image/upload/w_auto,c_scale,q_auto,f_auto/sample.jpg"
  alt="자동 최적화된 이미지"
/>
```

### Next.js 외부 이미지 허용 (`remotePatterns`)

Next.js 14+에서는 보안을 위해 `remotePatterns` 사용을 권장합니다.

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        port: "",
        pathname: "/my-bucket/**",
      },
    ],
    // AVIF 포맷 활성화 (선택)
    formats: ["image/avif", "image/webp"],
  },
};
```

---

## 6\. 레이아웃 이동(CLS) 방지

### 크기 명시

이미지가 로드되기 전에 브라우저가 자리를 확보할 수 있도록 `width`와 `height`를 반드시 명시합니다.

```html
<img src="img.jpg" width="800" height="600" alt="CLS 방지" />
```

### CSS aspect-ratio

반응형 컨테이너의 경우 CSS로 비율을 고정합니다.

```css
.image-container {
  width: 100%;
  aspect-ratio: 16 / 9; /* 공간 미리 확보 */
  overflow: hidden;
}
```

---

## 7\. 배경 이미지 최적화

### CSS Media Queries

```css
.hero {
  /* 기본 (모바일) - 작은 이미지 */
  background-image: url("hero-mobile.webp");
}

@media (min-width: 768px) {
  .hero {
    /* 데스크탑 - 큰 이미지 */
    background-image: url("hero-desktop.webp");
  }
}
```

---

## 8\. 이미지 프리로딩 (Preloading)

### 중요 이미지(LCP) 우선순위 높이기

```html
<link rel="preload" as="image" href="hero.webp" />

<img src="hero.webp" fetchpriority="high" alt="Hero" />
```

### Next.js Image

```tsx
<Image
  src="/hero.png"
  alt="Hero"
  priority={true} // 프리로드 + Lazy Loading 해제
/>
```

---

## 9\. 플레이스홀더 (Placeholder)

사용자에게 이미지가 로딩 중임을 시각적으로 알립니다.

### Blur Placeholder (Next.js)

```tsx
// 1. 로컬 이미지: 자동 생성
import myImage from './image.png';
<Image src={myImage} placeholder="blur" alt="..." />

// 2. 원격 이미지: base64 직접 주입 필요
<Image
  src="https://..."
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAE..."
  alt="..."
/>
```

---

## 10\. 실전 체크리스트

### 기획/디자인 단계

- [ ] SVG로 대체 가능한 아이콘/로고 식별
- [ ] 모바일/데스크탑용 이미지 별도 준비 (Art Direction)

### 개발 단계

- [ ] `next/image` 또는 `<picture>` 태그 사용
- [ ] 모든 `img` 태그에 `width`, `height` 명시 (CLS)
- [ ] LCP 이미지(첫 화면)에 `priority` / `fetchpriority="high"` 적용
- [ ] LCP 외 이미지는 `loading="lazy"` 및 `decoding="async"` 적용
- [ ] Webpack/Vite 빌드 시 이미지 압축 플러그인 설정

### 서버/배포 단계

- [ ] 이미지 CDN 캐싱 정책(Cache-Control) 확인
- [ ] `next.config.js`에 `image/avif` 포맷 활성화 확인

---

## 참고 자료

- [Web.dev - Optimize your images](https://web.dev/fast/#optimize-your-images)
- [Next.js Docs - Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Can I use - AVIF](https://caniuse.com/avif)
- [MDN - HTML Image element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img)
