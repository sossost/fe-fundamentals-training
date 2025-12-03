# 번들 크기 최적화 (Bundle Size Optimization)

## 개요

번들 크기는 웹 애플리케이션의 초기 로딩 시간에 직접적인 영향을 미칩니다. 작은 번들은 더 빠른 다운로드와 파싱 시간을 의미하며, 특히 모바일 환경에서 중요합니다.

## 왜 중요한가?

- **초기 로딩 시간**: 번들이 클수록 다운로드 시간 증가
- **파싱 시간**: JavaScript 파싱은 메인 스레드를 블로킹
- **모바일 데이터**: 사용자의 데이터 사용량에 직접 영향
- **Core Web Vitals**: LCP(Largest Contentful Paint)에 부정적 영향

---

## 1\. 번들 분석 (Bundle Analysis)

### webpack-bundle-analyzer

```bash
# 설치
npm install --save-dev webpack-bundle-analyzer

# package.json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

```js
// webpack.config.js
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: true,
    }),
  ],
};
```

### Vite 번들 분석 (rollup-plugin-visualizer)

Vite는 Rollup 기반이므로 전용 플러그인을 사용하여 분석합니다.

```bash
# 설치
npm install --save-dev rollup-plugin-visualizer
```

```js
// vite.config.js
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({
      filename: "./dist/stats.html", // 생성될 분석 파일 경로
      open: true, // 빌드 후 자동 실행
    }),
  ],
});
```

### Next.js 번들 분석

```bash
# @next/bundle-analyzer 사용
npm install @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // Next.js config
});
```

---

## 2\. 코드 스플리팅 (Code Splitting)

### React.lazy와 Suspense

```tsx
import { lazy, Suspense } from "react";

// 동적 import로 컴포넌트 분리
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 라우트 기반 스플리팅

```tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>페이지 로딩 중...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Next.js 최적화 (Pages vs App Router)

**Pages Router (기존):** `next/dynamic` 사용

```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("../components/Chart"), {
  ssr: false, // 클라이언트 사이드 전용
});
```

**App Router (Next.js 13+):** 서버 컴포넌트 활용
App Router의 모든 컴포넌트는 기본적으로 **Server Component**입니다. 이는 브라우저 번들에 JavaScript 코드가 포함되지 않으므로 가장 강력한 최적화 방법입니다. 상호작용이 필요한 경우에만 `"use client"`를 선언합니다.

---

## 3\. 트리 쉐이킹 (Tree Shaking)

### ES Modules 사용

```js
// ❌ CommonJS - 트리 쉐이킹 불가
const _ = require("lodash");

// ✅ ES Modules - 트리 쉐이킹 가능
import { debounce } from "lodash-es";
```

### 라이브러리 선택 시 주의사항

```js
// ❌ 전체 라이브러리 import
// Webpack 설정에 따라 불필요한 코드가 포함될 수 있음
import _ from "lodash";

// ✅ 필요한 함수만 import (가장 안전함)
import debounce from "lodash/debounce";
import format from "date-fns/format";
```

### package.json sideEffects

```json
{
  "name": "my-package",
  "sideEffects": false,
  "sideEffects": ["*.css", "./src/polyfills.js"]
}
```

---

## 4\. 외부 라이브러리 최적화

### 라이브러리 대체

| 라이브러리  | 크기         | 대체안          | 크기                 |
| ----------- | ------------ | --------------- | -------------------- |
| moment      | \~70KB       | dayjs           | \~2KB                |
| lodash      | \~70KB       | lodash-es       | \~70KB (트리 쉐이킹) |
| axios       | \~13KB       | fetch (내장)    | 0KB                  |
| react-icons | 전체 \~500KB | 필요한 아이콘만 | \~1-5KB              |

### 아이콘 최적화 (react-icons)

`react-icons`는 트리 쉐이킹을 지원하지만, 빌드 속도 향상과 확실한 최적화를 위해 개별 경로 import를 권장합니다.

```tsx
// ⚠️ 빌드 도구에 따라 전체 팩 로딩 가능성 있음
import { FaUser, FaHome } from "react-icons/fa";

// ✅ 개별 파일 직접 import (권장)
import FaUser from "react-icons/fa/FaUser";
import FaHome from "react-icons/fa/FaHome";

// 또는 SVG 직접 사용
import UserIcon from "./icons/user.svg";
```

---

## 5\. 중복 코드 제거

### webpack SplitChunksPlugin

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

---

## 6\. 압축 (Compression)

### Gzip 압축

```js
// webpack.config.js
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
    }),
  ],
};
```

### Brotli 압축

```js
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress", // Node 11.7+ 내장
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 10240,
    }),
  ],
};
```

---

## 7\. 소스맵 최적화

프로덕션에서는 보안과 크기를 위해 소스맵을 숨기거나 분리합니다.

```js
// webpack.config.js
module.exports = {
  devtool:
    process.env.NODE_ENV === "production"
      ? "source-map" // .map 파일로 분리 (디버깅용)
      : "eval-source-map", // 개발: 빠른 빌드
};

// 또는 프로덕션에서 아예 제거
// devtool: false
```

---

## 8\. 미니파이 (Minification)

### Terser (JavaScript)

Webpack 5는 기본적으로 Terser를 내장하고 있으나, 옵션 커스텀 시 재정의가 필요합니다.

```js
// webpack.config.js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
};
```

### CSS Minification (주의)

`minimizer` 배열을 재정의할 때, \*\*`'...'` (Spread Syntax)\*\*를 포함해야 기본 JS Minifier(Terser)가 사라지지 않고 함께 작동합니다.

```js
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      `...`, // 👈 중요: 기존 JS 압축 설정 유지
      new CssMinimizerPlugin(),
    ],
  },
};
```

---

## 9\. 실전 체크리스트

### 빌드 전

- [ ] 번들 분석기(Webpack/Vite)로 거대 의존성 확인
- [ ] 사용하지 않는 라이브러리 제거
- [ ] moment → dayjs 경량화
- [ ] 아이콘 라이브러리 개별 import 확인

### 빌드 설정

- [ ] 코드 스플리팅 적용 (라우트, 컴포넌트)
- [ ] SplitChunksPlugin 최적화
- [ ] CSS Minification 설정 시 `...` 누락 확인
- [ ] Gzip/Brotli 압축 적용

### 런타임

- [ ] Next.js App Router (Server Components) 적극 활용
- [ ] 큰 컴포넌트 Lazy Loading
- [ ] 이미지/폰트 최적화

---

## 10\. 측정 도구

### Lighthouse

```bash
# Chrome DevTools > Lighthouse 탭
# 또는 CLI
npx lighthouse https://example.com --view
```

### Bundlephobia

웹사이트: [https://bundlephobia.com/](https://bundlephobia.com/)
npm 패키지의 크기와 트리 쉐이킹 지원 여부를 사전에 확인

---

## 참고 자료

- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Vite Features - Build Optimizations](https://www.google.com/search?q=https://vitejs.dev/guide/features.html%23build-optimizations)
- [Next.js Optimizing Bundle Size](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
