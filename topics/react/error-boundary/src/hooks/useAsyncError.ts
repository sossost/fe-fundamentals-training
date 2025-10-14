/**
 * 이벤트 핸들러와 비동기 함수에서 에러를 Error Boundary로 전파하는 훅
 */

import { useCallback, useState } from "react";
import { BaseError } from "../types/errors";
import { normalizeError } from "../utils/errorTypeGuards";

/**
 * 비동기 에러를 Error Boundary로 전파
 *
 * Error Boundary는 렌더링 중 에러만 캐치하므로,
 * 이벤트 핸들러나 비동기 함수의 에러는 이 훅으로 처리
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const throwError = useAsyncError();
 *
 *   const handleClick = async () => {
 *     try {
 *       await fetchData();
 *     } catch (error) {
 *       throwError(error); // Error Boundary가 캐치
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>데이터 로드</button>;
 * }
 * ```
 */
export function useAsyncError() {
  const [, setError] = useState();

  return useCallback((error: unknown) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * 에러 상태를 관리하고 Error Boundary와 통합
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { setError, clearError } = useAsyncErrorHandler();
 *
 *   const loadData = async () => {
 *     try {
 *       const data = await api.getData();
 *       return data;
 *     } catch (err) {
 *       setError(err); // Error Boundary가 캐치
 *     }
 *   };
 *
 *   return <button onClick={loadData}>로드</button>;
 * }
 * ```
 */
export function useAsyncErrorHandler(initialError?: unknown) {
  const [error, setErrorState] = useState<unknown>(initialError);
  const throwError = useAsyncError();

  // 에러가 설정되면 Error Boundary로 전파
  if (error) {
    throwError(error);
  }

  const setError = useCallback((err: unknown) => {
    setErrorState(err);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(undefined);
  }, []);

  return {
    setError,
    clearError,
  };
}

/**
 * 비동기 함수를 래핑하여 에러를 자동으로 Error Boundary로 전파
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const safeAsync = useAsyncErrorWrapper();
 *
 *   const handleClick = safeAsync(async () => {
 *     const data = await fetchData();
 *     console.log(data);
 *   });
 *
 *   return <button onClick={handleClick}>로드</button>;
 * }
 * ```
 */
export function useAsyncErrorWrapper() {
  const throwError = useAsyncError();

  return useCallback(
    <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<void> => {
        try {
          await fn(...args);
        } catch (error) {
          throwError(error);
        }
      };
    },
    [throwError]
  );
}

/**
 * try-catch 없이 안전하게 비동기 함수 실행
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const execute = useSafeAsync();
 *
 *   const handleClick = () => {
 *     execute(async () => {
 *       const data = await fetchData();
 *       console.log(data);
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>로드</button>;
 * }
 * ```
 */
export function useSafeAsync() {
  const throwError = useAsyncError();

  return useCallback(
    async <T>(
      fn: () => Promise<T>,
      onError?: (error: BaseError) => void
    ): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (error) {
        const normalizedError = normalizeError(error);

        if (onError) {
          onError(normalizedError);
        }

        throwError(normalizedError);
        return undefined;
      }
    },
    [throwError]
  );
}
