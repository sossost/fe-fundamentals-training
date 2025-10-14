import React from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { SmartErrorFallback } from "../components/ErrorFallback";
import {
  useAsyncError,
  useAsyncErrorHandler,
  useAsyncErrorWrapper,
  useSafeAsync,
} from "../hooks/useAsyncError";
import {
  ValidationError,
  NetworkError,
  AuthenticationError,
} from "../types/errors";
import { safeFetch } from "../utils/errorHandler";

// ============================================================================
// Event Handler & Async Error Examples
// ============================================================================

/**
 * 이벤트 핸들러와 비동기 함수에서 발생하는 에러 처리 예시
 *
 * Error Boundary는 렌더링 중 에러만 캐치하므로,
 * 이벤트 핸들러나 비동기 코드의 에러는 별도 처리 필요
 */
export function EventHandlerErrorExample() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">
        이벤트 핸들러 & 비동기 에러 처리
      </h1>

      {/* 패턴 1: useAsyncError */}
      <Section title="패턴 1: useAsyncError - 기본">
        <ErrorBoundary fallback={<SmartErrorFallback />}>
          <BasicAsyncError />
        </ErrorBoundary>
      </Section>

      {/* 패턴 2: useAsyncErrorHandler */}
      <Section title="패턴 2: useAsyncErrorHandler - 상태 관리">
        <ErrorBoundary fallback={<SmartErrorFallback />}>
          <AsyncErrorWithState />
        </ErrorBoundary>
      </Section>

      {/* 패턴 3: useAsyncErrorWrapper */}
      <Section title="패턴 3: useAsyncErrorWrapper - 래퍼">
        <ErrorBoundary fallback={<SmartErrorFallback />}>
          <AsyncErrorWrapper />
        </ErrorBoundary>
      </Section>

      {/* 패턴 4: useSafeAsync */}
      <Section title="패턴 4: useSafeAsync - 안전 실행">
        <ErrorBoundary fallback={<SmartErrorFallback />}>
          <SafeAsyncExecution />
        </ErrorBoundary>
      </Section>

      {/* 패턴 5: 수동 try-catch */}
      <Section title="패턴 5: 수동 try-catch">
        <ErrorBoundary fallback={<SmartErrorFallback />}>
          <ManualTryCatch />
        </ErrorBoundary>
      </Section>

      {/* 패턴 6: API 에러 */}
      <Section title="패턴 6: API 에러 처리">
        <ErrorBoundary fallback={<SmartErrorFallback />}>
          <ApiErrorHandling />
        </ErrorBoundary>
      </Section>
    </div>
  );
}

// ============================================================================
// 패턴 1: useAsyncError - 기본 사용법
// ============================================================================

function BasicAsyncError() {
  const throwError = useAsyncError();

  const handleClick = async () => {
    try {
      // 비동기 작업 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("비동기 에러 발생!");
    } catch (error) {
      // Error Boundary로 전파
      throwError(error);
    }
  };

  const handleValidationError = () => {
    try {
      throw new ValidationError(
        {
          email: ["이메일 형식이 올바르지 않습니다"],
          password: ["비밀번호는 8자 이상이어야 합니다"],
        },
        "입력값을 확인해주세요"
      );
    } catch (error) {
      throwError(error);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-600">
        이벤트 핸들러에서 에러를 Error Boundary로 전파
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          일반 에러 발생
        </button>
        <button
          onClick={handleValidationError}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          유효성 에러 발생
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 패턴 2: useAsyncErrorHandler - 에러 상태 관리
// ============================================================================

function AsyncErrorWithState() {
  const { setError } = useAsyncErrorHandler();
  const [loading, setLoading] = React.useState(false);

  const handleLoad = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new NetworkError("네트워크 연결에 실패했습니다");
    } catch (error) {
      setError(error); // Error Boundary가 캐치
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-600">
        에러 상태를 관리하고 Error Boundary로 전파
      </p>
      <button
        onClick={handleLoad}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "로딩 중..." : "네트워크 에러 발생"}
      </button>
    </div>
  );
}

// ============================================================================
// 패턴 3: useAsyncErrorWrapper - 함수 래핑
// ============================================================================

function AsyncErrorWrapper() {
  const safeAsync = useAsyncErrorWrapper();

  // 자동으로 에러를 Error Boundary로 전파
  const handleClick = safeAsync(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    throw new AuthenticationError("로그인이 필요합니다");
  });

  const handleDataLoad = safeAsync(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    throw new Error("데이터 로딩 실패");
  });

  return (
    <div className="space-y-3">
      <p className="text-gray-600">비동기 함수를 래핑하여 자동 에러 처리</p>
      <div className="flex gap-2">
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          인증 에러
        </button>
        <button
          onClick={handleDataLoad}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
        >
          데이터 에러
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 패턴 4: useSafeAsync - 안전한 실행
// ============================================================================

function SafeAsyncExecution() {
  const execute = useSafeAsync();
  const [result, setResult] = React.useState<string>("");

  const handleExecute = () => {
    execute(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        throw new Error("실행 중 에러 발생");
      },
      (error) => {
        // 에러 발생 전 커스텀 처리
        console.error("에러 발생:", error);
        setResult(`에러: ${error.message}`);
      }
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-600">안전하게 실행하고 에러 발생 시 콜백 처리</p>
      <button
        onClick={handleExecute}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        안전 실행 (에러 발생)
      </button>
      {result && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{result}</p>
      )}
    </div>
  );
}

// ============================================================================
// 패턴 5: 수동 try-catch
// ============================================================================

function ManualTryCatch() {
  const throwError = useAsyncError();
  const [status, setStatus] = React.useState<string>("");

  const handleSubmit = async () => {
    setStatus("처리 중...");

    try {
      // 비동기 작업
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 유효성 검증
      const isValid = Math.random() > 0.5;
      if (!isValid) {
        throw new ValidationError(
          { form: ["폼 검증 실패"] },
          "제출할 수 없습니다"
        );
      }

      setStatus("✅ 성공!");
    } catch (error) {
      setStatus("❌ 실패");
      // 에러를 Error Boundary로 전파
      setTimeout(() => throwError(error), 500);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-600">수동 try-catch로 에러 처리 후 전파</p>
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
      >
        폼 제출 (랜덤 에러)
      </button>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}

// ============================================================================
// 패턴 6: API 에러 처리
// ============================================================================

function ApiErrorHandling() {
  const throwError = useAsyncError();
  const [data, setData] = React.useState<any>(null);

  const handleApiCall = async () => {
    try {
      // safeFetch는 HTTP 에러를 적절한 에러 클래스로 변환
      const result = await safeFetch("/api/users/999", {
        timeout: 5000,
      });
      setData(result);
    } catch (error) {
      // Error Boundary로 전파
      throwError(error);
    }
  };

  const handleTimeout = async () => {
    try {
      const result = await safeFetch("/api/slow-endpoint", {
        timeout: 100, // 매우 짧은 타임아웃
      });
      setData(result);
    } catch (error) {
      throwError(error);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-600">API 요청 에러를 Error Boundary로 전파</p>
      <div className="flex gap-2">
        <button
          onClick={handleApiCall}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          404 에러
        </button>
        <button
          onClick={handleTimeout}
          className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
        >
          타임아웃 에러
        </button>
      </div>
      {data && (
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
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
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}
