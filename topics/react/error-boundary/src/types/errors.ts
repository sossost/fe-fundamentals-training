/**
 * 계층적 에러 클래스 정의
 *
 * 에러를 도메인별로 분류하고 타입 안전하게 처리하기 위한 구조
 */

// ============================================================================
// Base Types
// ============================================================================

export interface ErrorContext {
  [key: string]: any;
}

export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

// ============================================================================
// Base Error Class
// ============================================================================

export abstract class BaseError extends Error {
  public readonly timestamp: string;
  public readonly context?: ErrorContext;
  public readonly severity: ErrorSeverity;

  constructor(
    message: string,
    context?: ErrorContext,
    severity: ErrorSeverity = "error"
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.severity = severity;

    // 프로토타입 체인 유지 (TypeScript/Babel에서 필요)
    Object.setPrototypeOf(this, new.target.prototype);

    // 스택 트레이스 캡처
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 에러를 직렬화 (로깅/전송용)
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp,
      context: this.context,
      severity: this.severity,
      stack: this.stack,
    };
  }
}

// ============================================================================
// Client Errors (4xx) - 클라이언트 측 문제
// ============================================================================

export class ClientError extends BaseError {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number = 400,
    context?: ErrorContext
  ) {
    super(message, context, "warning");
    this.statusCode = statusCode;
  }
}

/**
 * 400 Bad Request - 유효성 검증 실패
 */
export class ValidationError extends ClientError {
  public readonly errors: Record<string, string[]>;

  constructor(
    errors: Record<string, string[]>,
    message: string = "입력값을 확인해주세요",
    context?: ErrorContext
  ) {
    super(message, 400, context);
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized - 인증 실패
 */
export class AuthenticationError extends ClientError {
  constructor(message: string = "로그인이 필요합니다", context?: ErrorContext) {
    super(message, 401, context);
    this.severity = "warning";
  }
}

/**
 * 403 Forbidden - 권한 부족
 */
export class AuthorizationError extends ClientError {
  public readonly requiredRole?: string;

  constructor(
    message: string = "접근 권한이 없습니다",
    requiredRole?: string,
    context?: ErrorContext
  ) {
    super(message, 403, context);
    this.requiredRole = requiredRole;
  }
}

/**
 * 404 Not Found - 리소스 없음
 */
export class NotFoundError extends ClientError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string = "요청하신 정보를 찾을 수 없습니다",
    resourceType?: string,
    resourceId?: string,
    context?: ErrorContext
  ) {
    super(message, 404, context);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * 409 Conflict - 중복/충돌
 */
export class ConflictError extends ClientError {
  constructor(
    message: string = "이미 존재하는 데이터입니다",
    context?: ErrorContext
  ) {
    super(message, 409, context);
  }
}

/**
 * 429 Too Many Requests - 요청 제한
 */
export class RateLimitError extends ClientError {
  public readonly retryAfter?: number; // 초 단위

  constructor(
    retryAfter?: number,
    message: string = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요",
    context?: ErrorContext
  ) {
    super(message, 429, context);
    this.retryAfter = retryAfter;
  }
}

// ============================================================================
// Server Errors (5xx) - 서버 측 문제
// ============================================================================

export class ServerError extends BaseError {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number = 500,
    context?: ErrorContext
  ) {
    super(message, context, "error");
    this.statusCode = statusCode;
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ServerError {
  constructor(
    message: string = "서버에서 문제가 발생했습니다",
    context?: ErrorContext
  ) {
    super(message, 500, context);
    this.severity = "fatal";
  }
}

/**
 * 502 Bad Gateway
 */
export class BadGatewayError extends ServerError {
  constructor(
    message: string = "외부 서비스 연결에 실패했습니다",
    context?: ErrorContext
  ) {
    super(message, 502, context);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ServerError {
  public readonly retryAfter?: number;

  constructor(
    retryAfter?: number,
    message: string = "서비스를 일시적으로 사용할 수 없습니다",
    context?: ErrorContext
  ) {
    super(message, 503, context);
    this.retryAfter = retryAfter;
  }
}

/**
 * 504 Gateway Timeout
 */
export class GatewayTimeoutError extends ServerError {
  constructor(
    message: string = "응답 시간이 초과되었습니다",
    context?: ErrorContext
  ) {
    super(message, 504, context);
  }
}

// ============================================================================
// Network Errors - 네트워크 문제
// ============================================================================

export class NetworkError extends BaseError {
  constructor(
    message: string,
    context?: ErrorContext,
    severity: ErrorSeverity = "error"
  ) {
    super(message, context, severity);
  }
}

/**
 * 요청 타임아웃
 */
export class TimeoutError extends NetworkError {
  public readonly timeoutMs: number;

  constructor(
    timeoutMs: number,
    message: string = "요청 시간이 초과되었습니다",
    context?: ErrorContext
  ) {
    super(message, context, "warning");
    this.timeoutMs = timeoutMs;
  }
}

/**
 * 네트워크 연결 실패
 */
export class ConnectionError extends NetworkError {
  constructor(
    message: string = "네트워크 연결을 확인해주세요",
    context?: ErrorContext
  ) {
    super(message, context, "warning");
  }
}

/**
 * 요청 취소 (AbortController)
 */
export class RequestCancelledError extends NetworkError {
  constructor(
    message: string = "요청이 취소되었습니다",
    context?: ErrorContext
  ) {
    super(message, context, "info");
  }
}

// ============================================================================
// Application Errors - 애플리케이션 로직 문제
// ============================================================================

export class ApplicationError extends BaseError {
  constructor(
    message: string,
    context?: ErrorContext,
    severity: ErrorSeverity = "error"
  ) {
    super(message, context, severity);
  }
}

/**
 * 비즈니스 로직 에러
 */
export class BusinessLogicError extends ApplicationError {
  public readonly code: string;

  constructor(code: string, message: string, context?: ErrorContext) {
    super(message, context, "warning");
    this.code = code;
  }
}

/**
 * 데이터 무결성 에러
 */
export class DataIntegrityError extends ApplicationError {
  constructor(
    message: string = "데이터 형식이 올바르지 않습니다",
    context?: ErrorContext
  ) {
    super(message, context, "error");
  }
}

/**
 * 설정 에러
 */
export class ConfigurationError extends ApplicationError {
  public readonly configKey: string;

  constructor(
    configKey: string,
    message: string = "설정이 올바르지 않습니다",
    context?: ErrorContext
  ) {
    super(message, context, "fatal");
    this.configKey = configKey;
    this.severity = "fatal";
  }
}
