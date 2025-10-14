import React, { Suspense, ReactNode } from "react";
import {
  ErrorBoundary,
  ErrorBoundaryProps,
  FallbackProps,
} from "./ErrorBoundary";

// ============================================================================
// AsyncBoundary - 에러 바운더리 + 서스펜스 통합
// ============================================================================

/**
 * AsyncBoundary는 ErrorBoundary와 Suspense를 결합한 컴포넌트
 *
 * 비동기 데이터 로딩 시:
 * - 로딩 중: Suspense fallback 표시
 * - 에러 발생: ErrorBoundary fallback 표시
 * - 성공: children 렌더
 *
 * @example
 * ```tsx
 * <AsyncBoundary
 *   errorFallback={<ErrorUI />}
 *   suspenseFallback={<LoadingUI />}
 * >
 *   <UserProfile />
 * </AsyncBoundary>
 * ```
 */

interface AsyncBoundaryProps extends Omit<ErrorBoundaryProps, "fallback"> {
  children: ReactNode;

  /**
   * 에러 발생 시 표시할 UI
   */
  errorFallback?: ReactNode | ((props: FallbackProps) => ReactNode);

  /**
   * 로딩 중 표시할 UI
   */
  suspenseFallback?: ReactNode;

  /**
   * ErrorBoundary FallbackComponent (errorFallback보다 우선)
   */
  ErrorFallbackComponent?: React.ComponentType<FallbackProps>;
}

export function AsyncBoundary({
  children,
  errorFallback,
  suspenseFallback = <DefaultSuspenseFallback />,
  ErrorFallbackComponent,
  ...errorBoundaryProps
}: AsyncBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      {...errorBoundaryProps}
      fallback={errorFallback}
      FallbackComponent={ErrorFallbackComponent}
    >
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// ============================================================================
// Default Loading Fallback
// ============================================================================

function DefaultSuspenseFallback(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner />
      <span className="ml-3 text-gray-600">로딩 중...</span>
    </div>
  );
}

function LoadingSpinner(): JSX.Element {
  return (
    <div className="w-6 h-6 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
  );
}

// ============================================================================
// 특화된 AsyncBoundary 변형들
// ============================================================================

/**
 * QueryBoundary - React Query v5/SWR 등과 함께 사용하기 좋은 바운더리
 *
 * @example
 * ```tsx
 * import { useSuspenseQuery } from '@tanstack/react-query';
 *
 * <QueryBoundary>
 *   <UserList /> // useSuspenseQuery 사용하는 컴포넌트
 * </QueryBoundary>
 * ```
 */
interface QueryBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: any) => void;
  onReset?: () => void;
}

export function QueryBoundary({
  children,
  loadingFallback,
  errorFallback,
  onError,
  onReset,
}: QueryBoundaryProps): JSX.Element {
  return (
    <AsyncBoundary
      errorFallback={errorFallback}
      suspenseFallback={loadingFallback}
      onError={onError}
      onReset={onReset}
    >
      {children}
    </AsyncBoundary>
  );
}

/**
 * PageBoundary - 페이지 단위 바운더리
 * 전체 페이지를 감싸서 에러/로딩 처리
 */
interface PageBoundaryProps {
  children: ReactNode;
  pageTitle?: string;
}

export function PageBoundary({
  children,
  pageTitle = "페이지",
}: PageBoundaryProps): JSX.Element {
  return (
    <AsyncBoundary
      errorFallback={({ error, resetError }) => (
        <PageErrorFallback
          error={error}
          resetError={resetError}
          pageTitle={pageTitle}
        />
      )}
      suspenseFallback={<PageLoadingFallback pageTitle={pageTitle} />}
    >
      {children}
    </AsyncBoundary>
  );
}

function PageLoadingFallback({
  pageTitle,
}: {
  pageTitle: string;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">{pageTitle} 로딩 중...</p>
    </div>
  );
}

function PageErrorFallback({
  error,
  resetError,
  pageTitle,
}: FallbackProps & { pageTitle: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="text-6xl mb-4">😢</div>
      <h1 className="text-2xl font-semibold mb-2">{pageTitle} 로딩 실패</h1>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <div className="flex gap-2">
        <button
          onClick={resetError}
          className="px-6 py-2.5 bg-blue-500 text-white border-none rounded-md cursor-pointer font-medium hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-2.5 bg-gray-200 text-gray-800 border-none rounded-md cursor-pointer font-medium hover:bg-gray-300 transition-colors"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  );
}

/**
 * WidgetBoundary - 개별 위젯/섹션 단위 바운더리
 * 부분 실패 시에도 나머지 페이지는 정상 동작
 */
interface WidgetBoundaryProps {
  children: ReactNode;
  widgetName?: string;
}

export function WidgetBoundary({
  children,
  widgetName = "위젯",
}: WidgetBoundaryProps): JSX.Element {
  return (
    <AsyncBoundary
      errorFallback={({ resetError }) => (
        <WidgetErrorFallback widgetName={widgetName} resetError={resetError} />
      )}
      suspenseFallback={<WidgetLoadingFallback />}
    >
      {children}
    </AsyncBoundary>
  );
}

function WidgetLoadingFallback(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[150px] bg-gray-50 rounded-lg">
      <LoadingSpinner />
    </div>
  );
}

function WidgetErrorFallback({
  widgetName,
  resetError,
}: {
  widgetName: string;
  resetError: () => void;
}): JSX.Element {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
      <p className="text-red-900 mb-4 text-sm">{widgetName} 로딩 실패</p>
      <button
        onClick={resetError}
        className="px-4 py-2 text-xs bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700 transition-colors"
      >
        재시도
      </button>
    </div>
  );
}
