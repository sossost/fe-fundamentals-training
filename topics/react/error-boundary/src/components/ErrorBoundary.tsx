import React, { Component, ErrorInfo, ReactNode } from "react";
import { BaseError } from "../types/errors";
import { normalizeError } from "../utils/errorTypeGuards";

// ============================================================================
// Types
// ============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode;

  /**
   * 에러 발생 시 렌더할 Fallback UI
   * - ReactNode: 정적 UI
   * - Function: 에러 정보를 받아 동적 UI 생성
   */
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);

  /**
   * Fallback UI 대신 사용할 컴포넌트
   */
  FallbackComponent?: React.ComponentType<FallbackProps>;

  /**
   * 에러 발생 시 호출되는 콜백
   */
  onError?: (error: BaseError, errorInfo: ErrorInfo) => void;

  /**
   * 에러 리셋 시 호출되는 콜백
   */
  onReset?: () => void;

  /**
   * 이 값들이 변경되면 자동으로 에러 상태 리셋
   * 예: [userId, projectId]
   */
  resetKeys?: Array<string | number>;

  /**
   * 특정 에러를 무시하고 상위 바운더리로 전파
   */
  shouldCaptureError?: (error: BaseError) => boolean;
}

export interface FallbackProps {
  error: BaseError;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: BaseError | null;
}

// ============================================================================
// Error Boundary Component (클래스형 - React 요구사항)
// ============================================================================

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 에러를 BaseError로 정규화
    const normalizedError = normalizeError(error);

    return {
      hasError: true,
      error: normalizedError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const normalizedError = normalizeError(error, {
      componentStack: errorInfo.componentStack,
    });

    // 특정 에러를 무시하고 상위로 전파
    if (
      this.props.shouldCaptureError &&
      !this.props.shouldCaptureError(normalizedError)
    ) {
      throw error;
    }

    // 에러 로깅/모니터링
    if (this.props.onError) {
      this.props.onError(normalizedError, errorInfo);
    } else {
      // 기본 콘솔 로깅
      console.error("ErrorBoundary caught an error:", normalizedError);
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // resetKeys가 변경되면 자동으로 에러 상태 리셋
    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      !this.arraysEqual(prevProps.resetKeys, resetKeys)
    ) {
      this.resetError();
    }
  }

  private arraysEqual(
    a: Array<string | number>,
    b: Array<string | number>
  ): boolean {
    return a.length === b.length && a.every((val, idx) => val === b[idx]);
  }

  resetError = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, FallbackComponent } = this.props;

    if (hasError && error) {
      const fallbackProps: FallbackProps = {
        error,
        resetError: this.resetError,
      };

      // 1. FallbackComponent 우선
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }

      // 2. fallback이 함수면 실행
      if (typeof fallback === "function") {
        return fallback(fallbackProps);
      }

      // 3. fallback이 ReactNode면 그대로 렌더
      if (fallback) {
        return fallback;
      }

      // 4. 기본 Fallback UI
      return <DefaultErrorFallback {...fallbackProps} />;
    }

    return children;
  }
}

// ============================================================================
// Default Fallback Component
// ============================================================================

function DefaultErrorFallback({
  error,
  resetError,
}: FallbackProps): JSX.Element {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div
      role="alert"
      className="p-8 m-8 border-2 border-red-500 rounded-lg bg-red-50"
    >
      <h2 className="text-red-600 mb-4 text-xl font-semibold">
        ⚠️ 문제가 발생했습니다
      </h2>

      <p className="mb-4 text-red-900">{error.message}</p>

      {isDev && error.stack && (
        <details className="mb-4">
          <summary className="cursor-pointer text-red-950 hover:text-red-700">
            스택 트레이스 보기
          </summary>
          <pre className="mt-2 p-4 bg-white border border-red-300 rounded overflow-auto text-sm">
            {error.stack}
          </pre>
        </details>
      )}

      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 text-white border-none rounded hover:bg-red-700 font-medium transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}

// ============================================================================
// Hooks - 함수형 컴포넌트에서 에러 던지기
// ============================================================================

/**
 * 함수형 컴포넌트에서 Error Boundary로 에러를 전파하는 훅
 *
 * 사용법:
 * ```tsx
 * const throwError = useErrorBoundary();
 *
 * const handleClick = () => {
 *   try {
 *     somethingDangerous();
 *   } catch (error) {
 *     throwError(error); // Error Boundary가 캐치
 *   }
 * };
 * ```
 */
export function useErrorBoundary(): (error: unknown) => void {
  const [, setError] = React.useState();

  return React.useCallback((error: unknown) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * 에러 상태를 관리하고 Error Boundary와 통합하는 훅
 *
 * 사용법:
 * ```tsx
 * const { error, setError, clearError } = useErrorHandler();
 *
 * const fetchData = async () => {
 *   try {
 *     const data = await api.getData();
 *   } catch (err) {
 *     setError(err); // Error Boundary가 캐치
 *   }
 * };
 * ```
 */
export function useErrorHandler(initialError?: unknown) {
  const [error, setError] = React.useState<unknown>(initialError);
  const throwError = useErrorBoundary();

  React.useEffect(() => {
    if (error) {
      throwError(error);
    }
  }, [error, throwError]);

  const clearError = React.useCallback(() => {
    setError(undefined);
  }, []);

  return {
    error,
    setError,
    clearError,
  };
}
