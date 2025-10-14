/**
 * 에러 핸들링 유틸리티 함수들
 *
 * API 요청, 비동기 작업 등에서 발생하는 에러를
 * 체계적으로 처리하기 위한 헬퍼 함수 모음
 */

import {
  BaseError,
  TimeoutError,
  ConnectionError,
  RequestCancelledError,
  ErrorContext,
} from "../types/errors";
import { createErrorFromResponse, normalizeError } from "./errorTypeGuards";

// ============================================================================
// Fetch Wrapper - 에러 처리가 내장된 fetch
// ============================================================================

interface FetchOptions extends RequestInit {
  timeout?: number;
  context?: ErrorContext;
}

/**
 * 에러 처리가 강화된 fetch wrapper
 *
 * - HTTP 에러를 적절한 에러 클래스로 변환
 * - 타임아웃 처리
 * - 네트워크 에러 감지
 *
 * @example
 * ```ts
 * const data = await safeFetch('/api/users', {
 *   timeout: 5000,
 *   context: { userId: '123' }
 * });
 * ```
 */
export async function safeFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 30000, context, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // HTTP 에러 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createErrorFromResponse(response.status, errorData, {
        ...context,
        url,
        method: fetchOptions.method || "GET",
      });
    }

    // 성공 응답
    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortError는 타임아웃 또는 취소
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(timeout, "요청 시간이 초과되었습니다", {
        ...context,
        url,
      });
    }

    // 네트워크 에러
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ConnectionError("네트워크 연결을 확인해주세요", {
        ...context,
        url,
      });
    }

    // BaseError는 그대로 전파
    if (error instanceof BaseError) {
      throw error;
    }

    // 기타 에러는 정규화
    throw normalizeError(error, { ...context, url });
  }
}

// ============================================================================
// Async Error Handler - 비동기 함수 에러 래핑
// ============================================================================

/**
 * 비동기 함수를 에러 핸들링과 함께 래핑
 *
 * @example
 * ```ts
 * const loadUser = withErrorHandling(
 *   async (userId: string) => {
 *     return await api.getUser(userId);
 *   },
 *   {
 *     onError: (error) => console.error(error),
 *     context: { component: 'UserProfile' }
 *   }
 * );
 * ```
 */
export function withErrorHandling<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: {
    onError?: (error: BaseError) => void;
    context?: ErrorContext;
  } = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (error) {
      const normalizedError = normalizeError(error, options.context);

      if (options.onError) {
        options.onError(normalizedError);
      }

      throw normalizedError;
    }
  };
}

// ============================================================================
// Retry Logic - 재시도 로직
// ============================================================================

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: "linear" | "exponential";
  shouldRetry?: (error: BaseError, attempt: number) => boolean;
  onRetry?: (error: BaseError, attempt: number) => void;
}

/**
 * 실패 시 재시도하는 래퍼 함수
 *
 * @example
 * ```ts
 * const data = await withRetry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   {
 *     maxAttempts: 3,
 *     delayMs: 1000,
 *     backoff: 'exponential'
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = "exponential",
    shouldRetry = (error) =>
      error instanceof BaseError && error.severity !== "fatal",
    onRetry,
  } = options;

  let lastError: BaseError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = normalizeError(error);

      // 마지막 시도거나 재시도 불가한 에러면 throw
      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // 재시도 콜백
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // 대기 시간 계산
      const delay =
        backoff === "exponential"
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs * attempt;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// ============================================================================
// Error Recovery - 에러 복구 전략
// ============================================================================

/**
 * 에러 발생 시 fallback 값을 반환
 *
 * @example
 * ```ts
 * const user = await withFallback(
 *   () => api.getUser(id),
 *   { name: 'Guest', id: 'unknown' }
 * );
 * ```
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Fallback value used due to error:", error);
    }
    return fallbackValue;
  }
}

/**
 * 여러 에러 복구 전략을 순차적으로 시도
 *
 * @example
 * ```ts
 * const data = await withFallbackStrategies([
 *   () => fetchFromPrimaryAPI(),
 *   () => fetchFromBackupAPI(),
 *   () => fetchFromCache(),
 *   () => Promise.resolve(defaultData)
 * ]);
 * ```
 */
export async function withFallbackStrategies<T>(
  strategies: Array<() => Promise<T>>
): Promise<T> {
  const errors: BaseError[] = [];

  for (const strategy of strategies) {
    try {
      return await strategy();
    } catch (error) {
      errors.push(normalizeError(error));
    }
  }

  // 모든 전략 실패
  throw normalizeError(new Error("All fallback strategies failed"), {
    attemptedStrategies: strategies.length,
    errors: errors.map((e) => e.toJSON()),
  });
}

// ============================================================================
// Batch Error Handling - 여러 요청 동시 처리
// ============================================================================

interface BatchResult<T> {
  success: T[];
  errors: Array<{ index: number; error: BaseError }>;
}

/**
 * 여러 프로미스를 실행하고 성공/실패 분리
 *
 * @example
 * ```ts
 * const { success, errors } = await batchWithErrors([
 *   api.getUser(1),
 *   api.getUser(2),
 *   api.getUser(3),
 * ]);
 * ```
 */
export async function batchWithErrors<T>(
  promises: Array<Promise<T>>
): Promise<BatchResult<T>> {
  const results = await Promise.allSettled(promises);

  const success: T[] = [];
  const errors: Array<{ index: number; error: BaseError }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      success.push(result.value);
    } else {
      errors.push({
        index,
        error: normalizeError(result.reason),
      });
    }
  });

  return { success, errors };
}

// ============================================================================
// AbortController Helpers
// ============================================================================

/**
 * 타임아웃이 있는 AbortController 생성
 *
 * @example
 * ```ts
 * const controller = createTimeoutController(5000);
 * fetch('/api/data', { signal: controller.signal });
 * ```
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * 여러 AbortController를 하나로 결합
 *
 * @example
 * ```ts
 * const combined = combineAbortControllers([controller1, controller2]);
 * fetch('/api', { signal: combined.signal });
 * ```
 */
export function combineAbortControllers(
  controllers: AbortController[]
): AbortController {
  const combined = new AbortController();

  controllers.forEach((controller) => {
    if (controller.signal.aborted) {
      combined.abort();
    } else {
      controller.signal.addEventListener("abort", () => combined.abort());
    }
  });

  return combined;
}

// ============================================================================
// Error Aggregation - 에러 수집
// ============================================================================

/**
 * 에러를 수집하고 나중에 한 번에 처리
 *
 * @example
 * ```ts
 * const collector = new ErrorCollector();
 *
 * await collector.execute(async () => {
 *   // 여러 작업 수행
 * });
 *
 * if (collector.hasErrors()) {
 *   console.error(collector.getErrors());
 * }
 * ```
 */
export class ErrorCollector {
  private errors: BaseError[] = [];

  async execute<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.errors.push(normalizeError(error));
      return null;
    }
  }

  add(error: unknown): void {
    this.errors.push(normalizeError(error));
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): BaseError[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }

  throwIfHasErrors(): void {
    if (this.hasErrors()) {
      throw normalizeError(new Error("Multiple errors occurred"), {
        errors: this.errors.map((e) => e.toJSON()),
      });
    }
  }
}
