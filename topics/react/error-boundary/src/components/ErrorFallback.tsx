import React from "react";
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ConnectionError,
  RateLimitError,
  ServiceUnavailableError,
  NotFoundError,
  BaseError,
} from "../types/errors";
import { isRetryableError } from "../utils/errorTypeGuards";

// ============================================================================
// Fallback Props Type
// ============================================================================

export interface ErrorFallbackProps {
  error: BaseError;
  resetError: () => void;
}

// ============================================================================
// Smart Error Fallback - 에러 타입별로 다른 UI 렌더
// ============================================================================

export function SmartErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps): JSX.Element {
  // 인증 에러
  if (error instanceof AuthenticationError) {
    return <AuthenticationErrorUI error={error} />;
  }

  // 권한 에러
  if (error instanceof AuthorizationError) {
    return <AuthorizationErrorUI error={error} />;
  }

  // 유효성 검증 에러
  if (error instanceof ValidationError) {
    return <ValidationErrorUI error={error} resetError={resetError} />;
  }

  // 404 Not Found
  if (error instanceof NotFoundError) {
    return <NotFoundErrorUI error={error} resetError={resetError} />;
  }

  // Rate Limit
  if (error instanceof RateLimitError) {
    return <RateLimitErrorUI error={error} resetError={resetError} />;
  }

  // Network/Timeout 에러
  if (error instanceof TimeoutError || error instanceof ConnectionError) {
    return <NetworkErrorUI error={error} resetError={resetError} />;
  }

  // Service Unavailable
  if (error instanceof ServiceUnavailableError) {
    return <ServiceUnavailableErrorUI error={error} resetError={resetError} />;
  }

  // 재시도 가능한 에러
  if (isRetryableError(error)) {
    return <RetryableErrorUI error={error} resetError={resetError} />;
  }

  // 기본 에러 UI
  return <GenericErrorUI error={error} resetError={resetError} />;
}

// ============================================================================
// Individual Error UI Components
// ============================================================================

function AuthenticationErrorUI({ error }: { error: AuthenticationError }) {
  const handleLogin = () => {
    // 로그인 페이지로 리다이렉트 또는 모달 열기
    window.location.href = "/login";
  };

  return (
    <ErrorContainer>
      <ErrorIcon>🔒</ErrorIcon>
      <ErrorTitle>로그인이 필요합니다</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>
      <ErrorButton onClick={handleLogin}>로그인하기</ErrorButton>
    </ErrorContainer>
  );
}

function AuthorizationErrorUI({ error }: { error: AuthorizationError }) {
  return (
    <ErrorContainer>
      <ErrorIcon>🚫</ErrorIcon>
      <ErrorTitle>접근 권한이 없습니다</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>
      {error.requiredRole && (
        <ErrorHint>필요한 권한: {error.requiredRole}</ErrorHint>
      )}
      <ErrorButton onClick={() => window.history.back()}>
        이전 페이지로
      </ErrorButton>
    </ErrorContainer>
  );
}

function ValidationErrorUI({
  error,
  resetError,
}: ErrorFallbackProps & { error: ValidationError }) {
  return (
    <ErrorContainer>
      <ErrorIcon>⚠️</ErrorIcon>
      <ErrorTitle>입력값을 확인해주세요</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>

      {/* 필드별 에러 메시지 */}
      <ValidationErrorList>
        {Object.entries(error.errors).map(([field, messages]) => (
          <ValidationErrorItem key={field}>
            <strong>{field}:</strong>
            <ul>
              {messages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </ValidationErrorItem>
        ))}
      </ValidationErrorList>

      <ErrorButton onClick={resetError}>확인</ErrorButton>
    </ErrorContainer>
  );
}

function NotFoundErrorUI({
  error,
  resetError,
}: ErrorFallbackProps & { error: NotFoundError }) {
  return (
    <ErrorContainer>
      <ErrorIcon>🔍</ErrorIcon>
      <ErrorTitle>페이지를 찾을 수 없습니다</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>

      {error.resourceType && error.resourceId && (
        <ErrorHint>
          {error.resourceType} (ID: {error.resourceId})을(를) 찾을 수 없습니다
        </ErrorHint>
      )}

      <ErrorActions>
        <ErrorButton onClick={() => (window.location.href = "/")}>
          홈으로 가기
        </ErrorButton>
        <ErrorButton variant="secondary" onClick={resetError}>
          다시 시도
        </ErrorButton>
      </ErrorActions>
    </ErrorContainer>
  );
}

function RateLimitErrorUI({
  error,
  resetError,
}: ErrorFallbackProps & { error: RateLimitError }) {
  const [countdown, setCountdown] = React.useState(error.retryAfter || 60);

  React.useEffect(() => {
    if (countdown <= 0) {
      resetError();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, resetError]);

  return (
    <ErrorContainer>
      <ErrorIcon>⏱️</ErrorIcon>
      <ErrorTitle>요청 한도 초과</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>
      <ErrorHint>{countdown}초 후 자동으로 재시도됩니다</ErrorHint>
      <ProgressBar current={countdown} total={error.retryAfter || 60} />
    </ErrorContainer>
  );
}

function NetworkErrorUI({
  error,
  resetError,
}: ErrorFallbackProps & { error: NetworkError }) {
  return (
    <ErrorContainer>
      <ErrorIcon>📡</ErrorIcon>
      <ErrorTitle>네트워크 연결 오류</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>
      <ErrorHint>인터넷 연결을 확인하고 다시 시도해주세요</ErrorHint>
      <ErrorButton onClick={resetError}>다시 시도</ErrorButton>
    </ErrorContainer>
  );
}

function ServiceUnavailableErrorUI({
  error,
  resetError,
}: ErrorFallbackProps & { error: ServiceUnavailableError }) {
  return (
    <ErrorContainer>
      <ErrorIcon>🔧</ErrorIcon>
      <ErrorTitle>서비스 점검 중</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>

      {error.retryAfter && (
        <ErrorHint>
          약 {Math.ceil(error.retryAfter / 60)}분 후 다시 시도해주세요
        </ErrorHint>
      )}

      <ErrorButton onClick={resetError}>새로고침</ErrorButton>
    </ErrorContainer>
  );
}

function RetryableErrorUI({ error, resetError }: ErrorFallbackProps) {
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    setRetrying(true);

    // 재시도 딜레이
    await new Promise((resolve) => setTimeout(resolve, 1000));

    resetError();
  };

  return (
    <ErrorContainer>
      <ErrorIcon>🔄</ErrorIcon>
      <ErrorTitle>일시적인 오류</ErrorTitle>
      <ErrorMessage>{error.message}</ErrorMessage>
      <ErrorButton onClick={handleRetry} disabled={retrying}>
        {retrying ? "재시도 중..." : "다시 시도"}
      </ErrorButton>
    </ErrorContainer>
  );
}

function GenericErrorUI({ error, resetError }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <ErrorContainer>
      <ErrorIcon>❌</ErrorIcon>
      <ErrorTitle>문제가 발생했습니다</ErrorTitle>
      <ErrorMessage>
        {isDev ? error.message : "일시적인 문제가 발생했습니다"}
      </ErrorMessage>

      {isDev && error.stack && (
        <ErrorDetails>
          <summary>상세 정보</summary>
          <pre>{error.stack}</pre>
        </ErrorDetails>
      )}

      <ErrorButton onClick={resetError}>다시 시도</ErrorButton>
    </ErrorContainer>
  );
}

// ============================================================================
// Styled Components (CSS-in-JS 또는 스타일 예시)
// ============================================================================

function ErrorContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 min-h-[400px] text-center">
      {children}
    </div>
  );
}

function ErrorIcon({ children }: { children: React.ReactNode }) {
  return <div className="text-6xl mb-4">{children}</div>;
}

function ErrorTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold mb-2 text-gray-800">{children}</h2>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base text-gray-600 mb-6 max-w-[500px]">{children}</p>
  );
}

function ErrorHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 mb-4">{children}</p>;
}

function ErrorButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const baseClasses =
    "px-6 py-2.5 text-sm font-medium rounded-md border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
}

function ErrorActions({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 mt-4">{children}</div>;
}

function ValidationErrorList({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-[500px] w-full">
      {children}
    </div>
  );
}

function ValidationErrorItem({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-sm text-red-900">{children}</div>;
}

function ErrorDetails({ children }: { children: React.ReactNode }) {
  return (
    <details className="mt-4 p-4 bg-gray-50 rounded-md max-w-[600px] w-full text-left">
      {children}
    </details>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = ((total - current) / total) * 100;

  return (
    <div className="w-[300px] h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
      <div
        className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
