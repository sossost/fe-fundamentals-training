"use client";

import React from "react";

// ============================================================================
// Next.js App Router - global-error.tsx
// ============================================================================

/**
 * Next.js App Router의 전역 에러 처리 컴포넌트
 *
 * 특징:
 * - 루트 레이아웃(app/layout.tsx)의 에러를 캐치
 * - 반드시 <html>, <body> 태그를 포함해야 함
 * - 프로덕션에서만 작동 (개발 모드에서는 error overlay 표시)
 *
 * 사용법:
 * app/global-error.tsx 파일로 생성
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // 치명적 에러 로깅
    console.error("Global error:", error);

    // 에러 모니터링 서비스에 전송 (Sentry 등)
    if (typeof window !== "undefined") {
      // Sentry.captureException(error, {
      //   level: 'fatal',
      //   tags: { type: 'global-error' },
      // });
    }
  }, [error]);

  return (
    <html lang="ko">
      <head>
        <title>오류 발생 - 서비스 복구 중</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="m-0 font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-red-50">
          <div className="max-w-[600px] w-full">
            {/* 에러 아이콘 */}
            <div className="text-9xl mb-8">🚨</div>

            {/* 제목 */}
            <h1 className="text-4xl font-extrabold text-red-600 mb-4">
              심각한 문제가 발생했습니다
            </h1>

            {/* 메시지 */}
            <p className="text-lg text-red-900 mb-8 leading-relaxed">
              애플리케이션에 예상치 못한 오류가 발생했습니다.
              <br />
              불편을 드려 죄송합니다.
            </p>

            {/* 개발 환경에서만 에러 메시지 표시 */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-white border-2 border-red-300 rounded-lg p-6 mb-8 text-left">
                <h3 className="text-base font-semibold text-red-600 mb-3">
                  개발자 정보:
                </h3>
                <p className="text-sm text-red-950 mb-2 font-mono">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-900 font-mono">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={reset}
                className="px-8 py-4 text-base font-semibold text-white bg-red-600 border-none rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>

              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="px-8 py-4 text-base font-semibold text-red-950 bg-red-200 border-none rounded-lg cursor-pointer hover:bg-red-300 transition-colors"
              >
                홈으로 가기
              </button>

              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="px-8 py-4 text-base font-semibold text-red-950 bg-red-100 border-none rounded-lg cursor-pointer hover:bg-red-200 transition-colors"
              >
                새로고침
              </button>
            </div>

            {/* 추가 안내 */}
            <div className="mt-12 p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-950 leading-relaxed">
                💡 <strong>문제가 계속되나요?</strong>
                <br />
                브라우저 캐시를 삭제하거나 다른 브라우저를 사용해보세요.
                <br />
                여전히 문제가 발생하면 고객센터로 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
