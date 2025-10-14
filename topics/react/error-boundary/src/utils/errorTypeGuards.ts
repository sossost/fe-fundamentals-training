/**
 * 에러 타입 체크 및 변환 유틸리티
 */

import {
  BaseError,
  ClientError,
  ServerError,
  NetworkError,
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  TimeoutError,
  ServiceUnavailableError,
  ConnectionError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  BadGatewayError,
  GatewayTimeoutError,
  ErrorContext,
} from "./errors";

// ============================================================================
// Type Guards - 에러 타입 체크
// ============================================================================

export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

export function isClientError(error: unknown): error is ClientError {
  return error instanceof ClientError;
}

export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

// 세부 타입 체크
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthError(
  error: unknown
): error is AuthenticationError | AuthorizationError {
  return (
    error instanceof AuthenticationError || error instanceof AuthorizationError
  );
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ServiceUnavailableError) return true;
  if (error instanceof ConnectionError) return true;
  return false;
}

// ============================================================================
// Error Factory - HTTP 응답으로부터 에러 생성
// ============================================================================

export function createErrorFromResponse(
  status: number,
  data?: any,
  context?: ErrorContext
): BaseError {
  const message = data?.message || data?.error || "요청 처리에 실패했습니다";

  // 4xx Client Errors
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400:
        if (data?.errors) {
          return new ValidationError(data.errors, message, context);
        }
        return new ClientError(message, status, context);

      case 401:
        return new AuthenticationError(message, context);

      case 403:
        return new AuthorizationError(message, data?.requiredRole, context);

      case 404:
        return new NotFoundError(
          message,
          data?.resourceType,
          data?.resourceId,
          context
        );

      case 409:
        return new ConflictError(message, context);

      case 429:
        return new RateLimitError(data?.retryAfter, message, context);

      default:
        return new ClientError(message, status, context);
    }
  }

  // 5xx Server Errors
  if (status >= 500 && status < 600) {
    switch (status) {
      case 500:
        return new InternalServerError(message, context);

      case 502:
        return new BadGatewayError(message, context);

      case 503:
        return new ServiceUnavailableError(data?.retryAfter, message, context);

      case 504:
        return new GatewayTimeoutError(message, context);

      default:
        return new ServerError(message, status, context);
    }
  }

  return new ApplicationError(message, context);
}

// ============================================================================
// Error Normalization - 에러 변환
// ============================================================================

/**
 * 일반 Error를 BaseError로 변환
 */
export function normalizeError(
  error: unknown,
  context?: ErrorContext
): BaseError {
  if (isBaseError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(error.message, {
      ...context,
      originalError: error.name,
      stack: error.stack,
    });
  }

  if (typeof error === "string") {
    return new ApplicationError(error, context);
  }

  return new ApplicationError("알 수 없는 오류가 발생했습니다", {
    ...context,
    rawError: error,
  });
}
