import React from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ValidationError } from "../types/errors";

// ============================================================================
// Basic Example - 기본 사용법
// ============================================================================

/**
 * ErrorBoundary 기본 사용 예시
 */
export function BasicExample() {
  return (
    <div>
      <h2>기본 에러 바운더리 예시</h2>

      {/* 1. 기본 fallback UI */}
      <ErrorBoundary>
        <ComponentThatMayThrow />
      </ErrorBoundary>

      {/* 2. 커스텀 fallback ReactNode */}
      <ErrorBoundary fallback={<CustomErrorUI />}>
        <ComponentThatMayThrow />
      </ErrorBoundary>

      {/* 3. 함수형 fallback */}
      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <div>
            <p>에러: {error.message}</p>
            <button onClick={resetError}>재시도</button>
          </div>
        )}
      >
        <ComponentThatMayThrow />
      </ErrorBoundary>

      {/* 4. 에러 로깅 */}
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error("에러 발생:", error);
          console.error("컴포넌트 스택:", errorInfo.componentStack);
          // Sentry.captureException(error);
        }}
      >
        <ComponentThatMayThrow />
      </ErrorBoundary>

      {/* 5. 자동 리셋 (resetKeys) */}
      <ErrorBoundaryWithAutoReset />
    </div>
  );
}

// ============================================================================
// Components
// ============================================================================

function ComponentThatMayThrow() {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error("의도적인 에러!");
  }

  return (
    <div>
      <p>정상 작동 중</p>
      <button onClick={() => setShouldThrow(true)}>에러 발생시키기</button>
    </div>
  );
}

function CustomErrorUI() {
  return (
    <div
      style={{ padding: "1rem", backgroundColor: "#fee", borderRadius: "4px" }}
    >
      <h3>❌ 커스텀 에러 UI</h3>
      <p>문제가 발생했습니다</p>
    </div>
  );
}

function ErrorBoundaryWithAutoReset() {
  const [userId, setUserId] = React.useState("user1");

  return (
    <div>
      <button onClick={() => setUserId(`user${Date.now()}`)}>
        사용자 변경 (자동 리셋)
      </button>

      <ErrorBoundary
        resetKeys={[userId]} // userId가 변경되면 자동으로 에러 상태 리셋
        onReset={() => console.log("에러 상태 리셋됨")}
      >
        <UserProfile userId={userId} />
      </ErrorBoundary>
    </div>
  );
}

function UserProfile({ userId }: { userId: string }) {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new ValidationError(
      { name: ["이름은 필수입니다"] },
      "유효성 검증 실패"
    );
  }

  return (
    <div>
      <p>사용자 ID: {userId}</p>
      <button onClick={() => setShouldThrow(true)}>에러 발생</button>
    </div>
  );
}
