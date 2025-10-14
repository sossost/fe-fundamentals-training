# 사용 가이드

이 문서는 에러 바운더리를 실제 프로젝트에 적용하는 방법을 단계별로 안내합니다.

---

## 🚀 빠른 시작

### 1단계: 기본 설정

```tsx
// App.tsx
import { ErrorBoundary } from "./error-boundary/components/ErrorBoundary";
import { SmartErrorFallback } from "./error-boundary/components/ErrorFallback";

function App() {
  return (
    <ErrorBoundary fallback={<SmartErrorFallback />}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 2단계: 에러 로거 초기화 (선택사항)

```tsx
// main.tsx 또는 _app.tsx
import { initErrorLogger } from "./error-boundary/utils/errorLogger";

initErrorLogger({
  environment:
    process.env.NODE_ENV === "production" ? "production" : "development",
  serviceName: "my-app",
  version: "1.0.0",
});
```

---

## 📝 시나리오별 사용법

### 시나리오 1: 렌더링 에러 처리

**문제**: 컴포넌트 렌더링 중 에러 발생

**해결책**: ErrorBoundary로 자동 처리

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent /> {/* 렌더 중 에러 발생 시 자동 캐치 */}
</ErrorBoundary>
```

---

### 시나리오 2: 이벤트 핸들러 에러 처리

**문제**: 버튼 클릭, 폼 제출 등 이벤트 핸들러에서 에러 발생

**해결책**: useAsyncError 훅 사용

```tsx
import { useAsyncError } from "./error-boundary/hooks/useAsyncError";

function SubmitForm() {
  const throwError = useAsyncError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitForm(formData);
    } catch (error) {
      throwError(error); // Error Boundary가 캐치
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// 사용
<ErrorBoundary fallback={<SmartErrorFallback />}>
  <SubmitForm />
</ErrorBoundary>;
```

---

### 시나리오 3: API 호출 에러 처리

**문제**: API 요청 중 에러 발생 (404, 500 등)

**해결책**: safeFetch 사용

```tsx
import { safeFetch } from "./error-boundary/utils/errorHandler";
import { useAsyncError } from "./error-boundary/hooks/useAsyncError";

function UserProfile({ userId }) {
  const throwError = useAsyncError();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await safeFetch(`/api/users/${userId}`);
        setUser(data);
      } catch (error) {
        throwError(error); // 404, 500 등을 적절한 에러 클래스로 변환
      }
    };
    loadUser();
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

---

### 시나리오 4: 비동기 함수 래핑

**문제**: 여러 곳에서 try-catch 반복

**해결책**: useAsyncErrorWrapper 사용

```tsx
import { useAsyncErrorWrapper } from "./error-boundary/hooks/useAsyncError";

function DataLoader() {
  const safeAsync = useAsyncErrorWrapper();

  // try-catch 없이 사용 가능!
  const handleLoad = safeAsync(async () => {
    const data = await fetchData();
    console.log(data);
  });

  return <button onClick={handleLoad}>데이터 로드</button>;
}
```

---

### 시나리오 5: 페이지 단위 에러 처리

**문제**: 페이지 전체에 에러 처리 필요

**해결책**: PageBoundary 사용

```tsx
import { PageBoundary } from "./error-boundary/components/AsyncBoundary";

function DashboardPage() {
  return (
    <PageBoundary pageTitle="대시보드">
      <Dashboard />
    </PageBoundary>
  );
}
```

---

### 시나리오 6: 위젯별 독립적 에러 처리

**문제**: 일부 위젯 에러로 전체 페이지가 망가지는 것 방지

**해결책**: WidgetBoundary 사용

```tsx
import { WidgetBoundary } from "./error-boundary/components/AsyncBoundary";

function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WidgetBoundary widgetName="사용자 통계">
        <UserStatsWidget />
      </WidgetBoundary>

      <WidgetBoundary widgetName="매출 차트">
        <SalesChart />
      </WidgetBoundary>
    </div>
  );
}
```

---

### 시나리오 7: React Query와 함께 사용

**문제**: React Query 에러를 Error Boundary로 처리

**해결책**: suspense 옵션 + AsyncBoundary

```tsx
import { AsyncBoundary } from './error-boundary/components/AsyncBoundary';
import { SmartErrorFallback } from './error-boundary/components/ErrorFallback';

function UserList() {
  // suspense: true로 설정
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    suspense: true,
  });

  return <div>{data.map(user => ...)}</div>;
}

// 사용
<AsyncBoundary
  errorFallback={<SmartErrorFallback />}
  suspenseFallback={<div>로딩 중...</div>}
>
  <UserList />
</AsyncBoundary>
```

---

### 시나리오 8: Next.js App Router

**문제**: Next.js에서 라우트별 에러 처리

**해결책**: error.tsx 사용

```tsx
// app/dashboard/error.tsx
"use client";

import { ErrorContent } from "./error-boundary/next/error";

export default function Error({ error, reset }) {
  return <ErrorContent error={error} reset={reset} />;
}
```

---

## 🎯 Best Practices

### ✅ DO

1. **계층적으로 배치**

   ```tsx
   <GlobalBoundary>
     <PageBoundary>
       <WidgetBoundary>
         <Component />
       </WidgetBoundary>
     </PageBoundary>
   </GlobalBoundary>
   ```

2. **에러 타입별 처리**

   ```tsx
   // SmartErrorFallback 사용
   <ErrorBoundary fallback={<SmartErrorFallback />}>
   ```

3. **이벤트 핸들러는 훅 사용**

   ```tsx
   const throwError = useAsyncError();
   ```

4. **API 요청은 safeFetch**
   ```tsx
   await safeFetch("/api/data");
   ```

### ❌ DON'T

1. **모든 컴포넌트에 바운더리**

   ```tsx
   // ❌ 과도한 중첩
   <ErrorBoundary>
     <ErrorBoundary>
       <ErrorBoundary>
         <div>Hello</div>
       </ErrorBoundary>
     </ErrorBoundary>
   </ErrorBoundary>
   ```

2. **에러 메시지 무시**

   ```tsx
   // ❌ 사용자에게 의미 없는 메시지
   <p>에러</p>

   // ✅ 명확한 메시지
   <p>{error.message}</p>
   ```

3. **프로덕션에서 스택 노출**

   ```tsx
   // ❌ 보안 위험
   <pre>{error.stack}</pre>;

   // ✅ 개발 환경에서만
   {
     isDev && <pre>{error.stack}</pre>;
   }
   ```

---

## 🔧 커스터마이징

### 커스텀 Fallback UI

```tsx
function MyCustomFallback({ error, resetError }: FallbackProps) {
  return (
    <div className="custom-error">
      <h2>앗! 문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>다시 시도</button>
    </div>
  );
}

<ErrorBoundary fallback={<MyCustomFallback />}>
  <App />
</ErrorBoundary>;
```

### 커스텀 에러 클래스

```tsx
// 프로젝트 특화 에러
export class PaymentError extends ApplicationError {
  public readonly transactionId: string;

  constructor(transactionId: string, message: string) {
    super(message, { transactionId }, "error");
    this.transactionId = transactionId;
  }
}

// 사용
throw new PaymentError("tx_123", "결제 처리 실패");
```

---

## 📚 추가 리소스

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Tailwind CSS](https://tailwindcss.com/)
