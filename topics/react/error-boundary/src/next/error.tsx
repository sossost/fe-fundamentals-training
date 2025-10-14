"use client";

import React from "react";
import { BaseError } from "../types/errors";
import {
  normalizeError,
  isAuthError,
  isNetworkError,
  isRetryableError,
} from "../utils/errorTypeGuards";

// ============================================================================
// Next.js App Router - error.tsx
// ============================================================================

/**
 * Next.js App Router의 라우트별 에러 처리 컴포넌트
 *
 * 특징:
 * - 자동으로 Error Boundary 역할 수행
 * - 해당 라우트 세그먼트의 클라이언트 에러만 캐치
 * - reset() 함수로 재시도 가능
 *
 * 사용법:
 * app/[route]/error.tsx 파일로 생성하면 자동 적용
 *
 * @example
 * ```
 * app/
 * ├── dashboard/
 * │   ├── page.tsx
 * │   └── error.tsx  <- 이 파일
 * ```
 */

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const normalizedError = normalizeError(error);

  React.useEffect(() => {
    // 에러 로깅 (Sentry, LogRocket 등)
    if (process.env.NODE_ENV === "development") {
      console.error("Route error:", normalizedError);
      console.error("Error context:", normalizedError.context);
      console.error("Error stack:", normalizedError.stack);
    } else {
      // 프로덕션에서는 외부 로깅 서비스만 사용
      // logError(normalizedError); // errorLogger 사용 권장
    }
  }, [normalizedError]);

  return (
    <div className="error-page">
      <ErrorContent error={normalizedError} reset={reset} />
    </div>
  );
}

// ============================================================================
// Error Content Component
// ============================================================================

function ErrorContent({
  error,
  reset,
}: {
  error: BaseError;
  reset: () => void;
}) {
  // 인증/권한 에러
  if (isAuthError(error)) {
    return (
      <ErrorContainer>
        <ErrorIcon>🔐</ErrorIcon>
        <ErrorTitle>접근 권한이 필요합니다</ErrorTitle>
        <ErrorMessage>{error.message}</ErrorMessage>
        <ButtonGroup>
          <PrimaryButton onClick={() => (window.location.href = "/login")}>
            로그인하기
          </PrimaryButton>
          <SecondaryButton onClick={() => window.history.back()}>
            이전 페이지로
          </SecondaryButton>
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  // 네트워크 에러
  if (isNetworkError(error)) {
    return (
      <ErrorContainer>
        <ErrorIcon>📡</ErrorIcon>
        <ErrorTitle>연결 문제가 발생했습니다</ErrorTitle>
        <ErrorMessage>{error.message}</ErrorMessage>
        <ErrorHint>인터넷 연결을 확인하고 다시 시도해주세요</ErrorHint>
        <PrimaryButton onClick={reset}>다시 시도</PrimaryButton>
      </ErrorContainer>
    );
  }

  // 재시도 가능한 에러
  if (isRetryableError(error)) {
    return (
      <ErrorContainer>
        <ErrorIcon>🔄</ErrorIcon>
        <ErrorTitle>일시적인 문제가 발생했습니다</ErrorTitle>
        <ErrorMessage>{error.message}</ErrorMessage>
        <PrimaryButton onClick={reset}>다시 시도</PrimaryButton>
      </ErrorContainer>
    );
  }

  // 기본 에러
  return (
    <ErrorContainer>
      <ErrorIcon>⚠️</ErrorIcon>
      <ErrorTitle>페이지 로딩 중 문제가 발생했습니다</ErrorTitle>
      <ErrorMessage>
        {process.env.NODE_ENV === "development"
          ? error.message
          : "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."}
      </ErrorMessage>

      {process.env.NODE_ENV === "development" && error.stack && (
        <ErrorDetails>
          <summary>개발자 정보</summary>
          <pre>{error.stack}</pre>
        </ErrorDetails>
      )}

      <ButtonGroup>
        <PrimaryButton onClick={reset}>다시 시도</PrimaryButton>
        <SecondaryButton onClick={() => (window.location.href = "/")}>
          홈으로 가기
        </SecondaryButton>
      </ButtonGroup>
    </ErrorContainer>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

function ErrorContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
      <div className="max-w-[600px] w-full bg-white rounded-2xl p-12 shadow-lg">
        {children}
      </div>
    </div>
  );
}

function ErrorIcon({ children }: { children: React.ReactNode }) {
  return <div className="text-8xl mb-6">{children}</div>;
}

function ErrorTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>;
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base text-gray-600 mb-6 leading-relaxed">{children}</p>
  );
}

function ErrorHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 mb-6">{children}</p>;
}

function ButtonGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 justify-center flex-wrap">{children}</div>;
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 text-base font-semibold text-white bg-blue-500 border-none rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 text-base font-semibold text-gray-700 bg-gray-200 border-none rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
    >
      {children}
    </button>
  );
}

function ErrorDetails({ children }: { children: React.ReactNode }) {
  return (
    <details className="mt-8 mb-8 text-left bg-gray-100 p-4 rounded-lg text-sm">
      {children}
    </details>
  );
}
