import React from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { SmartErrorFallback } from "../components/ErrorFallback";
import { WidgetBoundary, PageBoundary } from "../components/AsyncBoundary";

// ============================================================================
// Nested Boundaries Example - 계층적 에러 바운더리
// ============================================================================

/**
 * 계층적 에러 바운더리 패턴
 *
 * - 상위 바운더리: 치명적 에러 → 전체 페이지 대체
 * - 하위 바운더리: 부분 에러 → 해당 영역만 대체
 */
export function NestedBoundariesExample() {
  return (
    <PageBoundary pageTitle="대시보드">
      <Dashboard />
    </PageBoundary>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>대시보드</h1>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {/* 각 위젯이 독립적으로 에러 처리 */}
        <WidgetBoundary widgetName="사용자 통계">
          <UserStatsWidget />
        </WidgetBoundary>

        <WidgetBoundary widgetName="최근 활동">
          <RecentActivityWidget />
        </WidgetBoundary>

        <WidgetBoundary widgetName="매출 차트">
          <SalesChartWidget />
        </WidgetBoundary>

        <WidgetBoundary widgetName="알림">
          <NotificationsWidget />
        </WidgetBoundary>
      </div>
    </div>
  );
}

// ============================================================================
// Widgets
// ============================================================================

function UserStatsWidget() {
  const [shouldError, setShouldError] = React.useState(false);

  if (shouldError) {
    throw new Error("사용자 통계 로딩 실패");
  }

  return (
    <WidgetCard title="사용자 통계">
      <p>총 사용자: 1,234명</p>
      <p>활성 사용자: 567명</p>
      <button onClick={() => setShouldError(true)}>에러 발생</button>
    </WidgetCard>
  );
}

function RecentActivityWidget() {
  const [shouldError, setShouldError] = React.useState(false);

  if (shouldError) {
    throw new Error("최근 활동 로딩 실패");
  }

  return (
    <WidgetCard title="최근 활동">
      <ul>
        <li>사용자 A가 로그인했습니다</li>
        <li>사용자 B가 글을 작성했습니다</li>
      </ul>
      <button onClick={() => setShouldError(true)}>에러 발생</button>
    </WidgetCard>
  );
}

function SalesChartWidget() {
  return (
    <WidgetCard title="매출 차트">
      <p>📈 이번 달 매출: $12,345</p>
      <p>✅ 정상 작동 중</p>
    </WidgetCard>
  );
}

function NotificationsWidget() {
  return (
    <WidgetCard title="알림">
      <p>🔔 새로운 알림 3개</p>
      <p>✅ 정상 작동 중</p>
    </WidgetCard>
  );
}

// ============================================================================
// Utility Components
// ============================================================================

function WidgetCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "1.5rem",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h3
        style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ============================================================================
// Advanced Pattern - Selective Error Capturing
// ============================================================================

/**
 * 특정 에러만 캐치하고 나머지는 상위로 전파
 */
export function SelectiveErrorBoundary() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div>
          <h3>외부 에러</h3>
          <p>{error.message}</p>
          <button onClick={resetError}>재시도</button>
        </div>
      )}
    >
      <ErrorBoundary
        // ValidationError만 캐치하고, 나머지는 상위로 전파
        shouldCaptureError={(error) => error.name === "ValidationError"}
        fallback={({ error, resetError }) => (
          <div>
            <h3>유효성 검증 에러</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>다시 입력</button>
          </div>
        )}
      >
        <FormComponent />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

function FormComponent() {
  const [errorType, setErrorType] = React.useState<
    "validation" | "server" | null
  >(null);

  if (errorType === "validation") {
    throw new Error("ValidationError: 이름은 필수입니다");
  }

  if (errorType === "server") {
    throw new Error("ServerError: 서버 연결 실패");
  }

  return (
    <div>
      <h3>폼 컴포넌트</h3>
      <button onClick={() => setErrorType("validation")}>
        유효성 에러 발생
      </button>
      <button onClick={() => setErrorType("server")}>서버 에러 발생</button>
    </div>
  );
}
