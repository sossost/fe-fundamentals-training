# React/Next.js 에러 바운더리 & 계층적 에러 클래스

> 실무에서 사용하는 **체계적인 에러 핸들링 패턴**을 정리합니다.  
> 에러 클래스 계층 구조 설계부터 React Error Boundary, Next.js App Router 에러 처리, 실전 패턴까지 다룹니다.

---

## 📁 폴더 구조

```
error-boundary/
├─ src/
│  ├─ types/
│  │  └─ errors.ts              # 계층적 에러 클래스 정의
│  ├─ components/
│  │  ├─ ErrorBoundary.tsx      # React 에러 바운더리 (클래스형)
│  │  ├─ ErrorFallback.tsx      # 에러 UI 컴포넌트들 (Tailwind)
│  │  └─ AsyncBoundary.tsx      # 에러 + 서스펜스 통합 바운더리
│  ├─ utils/
│  │  ├─ errorTypeGuards.ts     # Type guards, Factory, Normalizer
│  │  ├─ errorHandler.ts        # 에러 핸들링 유틸리티
│  │  └─ errorLogger.ts         # 에러 로깅 (Sentry 등 연동)
│  ├─ hooks/
│  │  └─ useAsyncError.ts       # 비동기/이벤트 에러 처리 훅
│  ├─ next/
│  │  ├─ error.tsx              # Next.js 라우트 에러 처리 (Tailwind)
│  │  └─ global-error.tsx       # 전역 에러 처리 (Tailwind)
│  └─ examples/
│     ├─ BasicExample.tsx           # 기본 사용 예시
│     ├─ NestedBoundaries.tsx       # 중첩 바운더리 예시
│     ├─ ApiErrorExample.tsx        # API 에러 처리 예시
│     └─ EventHandlerErrorExample.tsx # 이벤트/비동기 에러 예시
└─ README.md
```

---

## 🎯 핵심 개념

### 1. 계층적 에러 클래스 설계

에러를 **도메인별로 분류**하고 **타입 안전하게 처리**하기 위한 구조:

```
BaseError (추상)
├─ ClientError (4xx)
│  ├─ ValidationError
│  ├─ AuthenticationError
│  └─ AuthorizationError
├─ ServerError (5xx)
│  ├─ InternalServerError
│  └─ ServiceUnavailableError
├─ NetworkError
│  ├─ TimeoutError
│  └─ ConnectionError
└─ ApplicationError
   ├─ NotFoundError
   └─ BusinessLogicError
```

**장점:**

- 에러 타입별로 다른 UI/처리 로직 적용 가능
- `instanceof`로 타입 안전한 에러 핸들링
- 에러 메타데이터 (statusCode, context 등) 체계적 관리

---

### 2. React Error Boundary

**렌더링 중 발생하는 에러**를 잡아 fallback UI를 보여주는 컴포넌트

#### 📌 핵심 포인트

- **클래스 컴포넌트**로만 구현 가능 (`componentDidCatch` 사용)
- **렌더링/라이프사이클/생성자**에서 발생한 에러만 캐치
- **이벤트 핸들러/비동기 코드**는 잡지 못함 → `try-catch` 또는 커스텀 훅 필요

#### ❌ Error Boundary가 잡지 못하는 에러

```tsx
// 1. 이벤트 핸들러
<button
  onClick={() => {
    throw new Error("클릭 에러");
  }}
>
  // ❌ Error Boundary가 못 잡음 → useAsyncError 훅 필요
</button>;

// 2. 비동기 코드
useEffect(() => {
  setTimeout(() => {
    throw new Error("비동기 에러"); // ❌ 못 잡음
  }, 1000);
}, []);

// 3. SSR (서버 사이드)
// Next.js에서는 error.tsx로 별도 처리
```

#### ✅ 이벤트 핸들러/비동기 에러 처리 방법

```tsx
import { useAsyncError } from "./hooks/useAsyncError";

function MyComponent() {
  const throwError = useAsyncError();

  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      throwError(error); // Error Boundary가 캐치!
    }
  };

  return <button onClick={handleClick}>데이터 로드</button>;
}
```

---

### 3. Next.js App Router 에러 처리

#### `error.tsx` (라우트별 에러)

- 해당 라우트 세그먼트의 **클라이언트 에러** 처리
- **자동으로 Error Boundary 역할**
- `reset()` 함수로 재시도 가능

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

#### `global-error.tsx` (전역 에러)

- **루트 레이아웃 에러** 처리
- 반드시 `<html>`, `<body>` 태그 포함해야 함

---

## 🛠️ 실전 패턴

### Pattern 1: 계층적 바운더리 배치

```tsx
<ErrorBoundary fallback={<GlobalErrorFallback />}>
  {" "}
  {/* 전역 */}
  <App>
    <ErrorBoundary fallback={<PageErrorFallback />}>
      {" "}
      {/* 페이지 */}
      <Page>
        <ErrorBoundary fallback={<WidgetErrorFallback />}>
          {" "}
          {/* 위젯 */}
          <CriticalWidget />
        </ErrorBoundary>
      </Page>
    </ErrorBoundary>
  </App>
</ErrorBoundary>
```

**원칙:**

- 상위 바운더리: 치명적 에러 → 전체 페이지 대체
- 하위 바운더리: 부분 에러 → 해당 영역만 대체 (나머지 정상 동작)

---

### Pattern 2: 에러 타입별 분기 처리

```tsx
import { SmartErrorFallback } from "./components/ErrorFallback";

// 자동으로 에러 타입 감지해서 적절한 UI 렌더
<ErrorBoundary fallback={<SmartErrorFallback />}>
  <MyComponent />
</ErrorBoundary>;

// 또는 직접 커스텀
function ErrorFallback({ error, resetError }: FallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginRedirect />;
  }

  if (error instanceof ValidationError) {
    return <ValidationErrorUI errors={error.errors} />;
  }

  if (error instanceof NetworkError) {
    return <NetworkErrorUI retry={resetError} />;
  }

  return <GenericErrorUI error={error} />;
}
```

---

### Pattern 3: AsyncBoundary (에러 + 서스펜스 통합)

```tsx
<AsyncBoundary errorFallback={<ErrorUI />} suspenseFallback={<LoadingUI />}>
  <DataComponent />
</AsyncBoundary>
```

**장점:**

- 로딩/에러 상태를 한 곳에서 관리
- 선언적 코드 작성 가능
- Tanstack Query, SWR 등과 함께 사용

---

### Pattern 4: 에러 복구 (Reset) 전략

```tsx
// 1. 컴포넌트 상태 초기화
<ErrorBoundary
  onReset={() => queryClient.resetQueries()}
  resetKeys={[userId]} // userId 변경 시 자동 리셋
>
  <UserProfile userId={userId} />
</ErrorBoundary>;

// 2. 재시도 로직
function ErrorUI({ resetError }: FallbackProps) {
  const handleRetry = () => {
    // 재시도 전 정리 작업
    clearCache();
    resetError();
  };

  return (
    <button
      onClick={handleRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      재시도
    </button>
  );
}
```

---

## 🔍 에러 로깅 & 모니터링

### 1. ErrorLogger 초기화

```tsx
import { initErrorLogger } from "./utils/errorLogger";

// 앱 초기화 시
initErrorLogger({
  environment: "production",
  serviceName: "my-app",
  version: "1.0.0",
  userId: currentUser?.id,
});
```

### 2. Error Boundary와 로깅 연동

```tsx
import { logError } from "./utils/errorLogger";

<ErrorBoundary
  onError={(error, errorInfo) => {
    // 자동 로깅
    logError(error, {
      componentStack: errorInfo.componentStack,
    });
  }}
>
  <App />
</ErrorBoundary>;
```

### 3. Sentry 연동

```tsx
// errorLogger.ts에서
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  if (error instanceof BaseError) {
    Sentry.captureException(error, {
      level: error.severity,
      tags: {
        errorType: error.constructor.name,
      },
      contexts: {
        error: error.context,
      },
    });
  }
}
```

---

## ⚡ 성능 고려사항

### 1. 에러 바운더리 남용 방지

- 모든 컴포넌트를 감싸지 말 것
- **의미 있는 경계**에만 배치 (페이지, 주요 위젯 등)

### 2. 에러 메시지 다국화

```ts
class ValidationError extends BaseError {
  constructor(errors: ValidationErrors, locale = "ko") {
    super(getLocalizedMessage("validation_error", locale));
    this.errors = errors;
  }
}
```

### 4. 프로덕션 vs 개발 환경 분리

```tsx
function ErrorFallback({ error }: FallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="p-8 bg-red-50 border border-red-500 rounded-lg">
      <h2 className="text-xl font-semibold text-red-600 mb-4">
        ⚠️ 문제가 발생했습니다
      </h2>

      <p className="mb-4 text-red-900">
        {isDev ? error.message : "일시적인 문제가 발생했습니다"}
      </p>

      {isDev && error.stack && (
        <details className="mb-4">
          <summary className="cursor-pointer">스택 트레이스</summary>
          <pre className="mt-2 p-4 bg-white border rounded overflow-auto text-sm">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
```

---

## 📊 실전 체크리스트

- [ ] 도메인별 에러 클래스 계층 정의 (`types/errors.ts`)
- [ ] Type Guards 및 유틸리티 분리 (`utils/errorTypeGuards.ts`)
- [ ] 페이지/섹션별 Error Boundary 배치
- [ ] 에러 타입별 fallback UI 준비 (Tailwind CSS)
- [ ] 이벤트 핸들러 에러: `useAsyncError` 훅 활용
- [ ] 비동기 에러: `useAsyncErrorWrapper` 또는 `useSafeAsync` 활용
- [ ] Next.js `error.tsx`, `global-error.tsx` 구현
- [ ] 에러 로깅 시스템 연동 (Sentry 등)
- [ ] 재시도 로직 구현 (`withRetry`)
- [ ] 사용자 친화적 에러 메시지 작성
- [ ] 에러 발생 시 알림/복구 플로우 설계

---

## 🔗 참고 자료

- [React Error Boundaries 공식 문서](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundary 라이브러리](https://github.com/bvaughn/react-error-boundary)

---

## 💡 핵심 요약

1. **에러 클래스 계층화**: 도메인별 분류로 타입 안전한 처리
2. **파일 구조 분리**: `types/` (타입 정의), `utils/` (유틸리티)
3. **계층적 바운더리**: 전역 → 페이지 → 위젯 순으로 배치
4. **타입별 분기**: `instanceof`로 에러 타입에 맞는 UI 렌더
5. **렌더링 에러**: Error Boundary가 자동 캐치
6. **이벤트/비동기 에러**: `useAsyncError` 훅으로 Error Boundary에 전파
7. **Next.js**: `error.tsx`로 라우트별 에러 처리
8. **Tailwind CSS**: 모든 UI 컴포넌트에 Tailwind 적용
9. **로깅/모니터링**: Sentry 등으로 에러 추적
10. **사용자 경험**: 명확한 메시지 + 재시도 옵션 제공
