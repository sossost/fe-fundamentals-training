import React from "react";
import { ErrorBoundary, useErrorHandler } from "../components/ErrorBoundary";
import { AsyncBoundary } from "../components/AsyncBoundary";
import { SmartErrorFallback } from "../components/ErrorFallback";
import {
  safeFetch,
  withRetry,
  withFallback,
  batchWithErrors,
} from "../utils/errorHandler";
import { NetworkError } from "../types/errors";

// ============================================================================
// API Error Handling Example
// ============================================================================

/**
 * API 요청 에러 처리 패턴
 */
export function ApiErrorExample() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>API 에러 처리 예시</h2>

      <Section title="1. 기본 API 호출 (이벤트 핸들러)">
        <BasicApiCall />
      </Section>

      <Section title="2. Suspense + Error Boundary">
        <AsyncBoundary
          errorFallback={<SmartErrorFallback />}
          suspenseFallback={<div>로딩 중...</div>}
        >
          <SuspenseComponent />
        </AsyncBoundary>
      </Section>

      <Section title="3. 재시도 로직">
        <RetryExample />
      </Section>

      <Section title="4. Fallback 값 사용">
        <FallbackExample />
      </Section>

      <Section title="5. 배치 요청">
        <BatchExample />
      </Section>
    </div>
  );
}

// ============================================================================
// 1. Basic API Call (이벤트 핸들러에서 에러 처리)
// ============================================================================

function BasicApiCall() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const { setError } = useErrorHandler(); // Error Boundary로 에러 전파

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await safeFetch("/api/users", {
        timeout: 5000,
        context: { component: "BasicApiCall" },
      });
      setData(result);
    } catch (error) {
      // Error Boundary가 캐치
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? "로딩 중..." : "데이터 가져오기"}
      </button>

      {data && (
        <pre
          style={{ marginTop: "1rem", padding: "1rem", background: "#f0f0f0" }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// 2. Suspense Component (렌더 중 에러)
// ============================================================================

let cache: Promise<any> | null = null;

function SuspenseComponent() {
  // Suspense를 위한 데이터 페칭
  const data = useSuspenseData();

  return (
    <div>
      <h4>사용자 데이터:</h4>
      <pre style={{ padding: "1rem", background: "#f0f0f0" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function useSuspenseData() {
  if (!cache) {
    cache = safeFetch("/api/users").then((data) => {
      // 임의로 에러 발생 (테스트용)
      if (Math.random() > 0.7) {
        throw new NetworkError("임의 네트워크 에러");
      }
      return data;
    });
  }

  // Suspense를 위한 throw
  throw cache.then(
    (data) => {
      cache = null;
      return data;
    },
    (error) => {
      cache = null;
      throw error;
    }
  );
}

// ============================================================================
// 3. Retry Logic
// ============================================================================

function RetryExample() {
  const [result, setResult] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const fetchWithRetry = async () => {
    setLoading(true);
    setResult("");

    try {
      const data = await withRetry(() => safeFetch("/api/unstable-endpoint"), {
        maxAttempts: 3,
        delayMs: 1000,
        backoff: "exponential",
        onRetry: (error, attempt) => {
          console.log(`재시도 ${attempt}회: ${error.message}`);
          setResult((prev) => `${prev}\n재시도 ${attempt}회...`);
        },
      });

      setResult((prev) => `${prev}\n✅ 성공!`);
    } catch (error) {
      setResult((prev) => `${prev}\n❌ 최종 실패`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchWithRetry} disabled={loading}>
        재시도 로직 테스트
      </button>
      {result && (
        <pre
          style={{ marginTop: "1rem", padding: "1rem", background: "#f0f0f0" }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// 4. Fallback Value
// ============================================================================

function FallbackExample() {
  const [user, setUser] = React.useState<any>(null);

  const loadUser = async () => {
    const userData = await withFallback(
      () => safeFetch("/api/user/123"),
      { id: "unknown", name: "Guest User", email: "guest@example.com" } // fallback
    );

    setUser(userData);
  };

  return (
    <div>
      <button onClick={loadUser}>사용자 로드 (Fallback 사용)</button>
      {user && (
        <div style={{ marginTop: "1rem" }}>
          <p>ID: {user.id}</p>
          <p>이름: {user.name}</p>
          <p>이메일: {user.email}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. Batch Requests
// ============================================================================

function BatchExample() {
  const [results, setResults] = React.useState<any>(null);

  const loadBatch = async () => {
    const userIds = [1, 2, 3, 4, 5];

    const { success, errors } = await batchWithErrors(
      userIds.map((id) => safeFetch(`/api/users/${id}`))
    );

    setResults({ success, errors });
  };

  return (
    <div>
      <button onClick={loadBatch}>배치 로드 (일부 실패 허용)</button>
      {results && (
        <div style={{ marginTop: "1rem" }}>
          <div>
            <h4>성공 ({results.success.length}개):</h4>
            <pre style={{ padding: "1rem", background: "#e8f5e9" }}>
              {JSON.stringify(results.success, null, 2)}
            </pre>
          </div>
          {results.errors.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h4>실패 ({results.errors.length}개):</h4>
              <pre style={{ padding: "1rem", background: "#ffebee" }}>
                {JSON.stringify(
                  results.errors.map((e: any) => ({
                    index: e.index,
                    message: e.error.message,
                  })),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Utility Components
// ============================================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>{title}</h3>
      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <div
            style={{
              padding: "1rem",
              background: "#ffebee",
              borderRadius: "4px",
            }}
          >
            <p style={{ color: "#c62828" }}>❌ {error.message}</p>
            <button onClick={resetError} style={{ marginTop: "0.5rem" }}>
              재시도
            </button>
          </div>
        )}
      >
        {children}
      </ErrorBoundary>
    </div>
  );
}
