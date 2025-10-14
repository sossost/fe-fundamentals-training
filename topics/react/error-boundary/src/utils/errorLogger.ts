/**
 * 에러 로깅 유틸리티
 *
 * Sentry, LogRocket, DataDog 등 에러 모니터링 서비스 연동
 */

import { BaseError, ErrorSeverity } from "../types/errors";

// ============================================================================
// Logger Interface
// ============================================================================

export interface ErrorLoggerConfig {
  environment: "development" | "staging" | "production";
  serviceName: string;
  version?: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorLogEntry {
  timestamp: string;
  errorType: string;
  message: string;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
  };
  device?: {
    userAgent: string;
    platform: string;
    language: string;
  };
  url: string;
  referrer: string;
}

// ============================================================================
// Error Logger Class
// ============================================================================

export class ErrorLogger {
  private config: ErrorLoggerConfig;
  private buffer: ErrorLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: ErrorLoggerConfig) {
    this.config = config;

    // 개발 환경이 아니면 주기적으로 버퍼 flush
    if (config.environment !== "development") {
      this.startAutoFlush(10000); // 10초마다
    }

    // 페이지 unload 시 버퍼 flush
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flush();
      });
    }
  }

  /**
   * 에러 로깅
   */
  log(error: BaseError, additionalContext?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      errorType: error.name,
      message: error.message,
      severity: error.severity,
      stack: error.stack,
      context: {
        ...error.context,
        ...additionalContext,
      },
      user: {
        id: this.config.userId,
      },
      device: this.getDeviceInfo(),
      url: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof window !== "undefined" ? document.referrer : "",
    };

    // 개발 환경에서는 콘솔에 출력
    if (this.config.environment === "development") {
      this.logToConsole(entry);
    }

    // 버퍼에 추가
    this.buffer.push(entry);

    // 치명적 에러는 즉시 전송
    if (error.severity === "fatal") {
      this.flush();
    }
  }

  /**
   * 버퍼의 로그를 서버로 전송
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      // 실제 로깅 서비스로 전송
      await this.sendToLoggingService(logs);
    } catch (error) {
      console.error("Failed to send logs:", error);
      // 실패한 로그는 버퍼에 다시 추가 (무한 루프 방지)
      this.buffer.push(...logs.slice(0, 100));
    }
  }

  /**
   * 로그를 서버로 전송 (실제 구현 예시)
   */
  private async sendToLoggingService(logs: ErrorLogEntry[]): Promise<void> {
    // Sentry 예시
    // logs.forEach(log => {
    //   Sentry.captureException(new Error(log.message), {
    //     level: log.severity,
    //     tags: {
    //       errorType: log.errorType,
    //       environment: this.config.environment,
    //     },
    //     contexts: {
    //       error: log.context,
    //       device: log.device,
    //     },
    //     user: log.user,
    //   });
    // });

    // 커스텀 API로 전송
    if (this.config.environment !== "development") {
      await fetch("/api/logs/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: this.config.serviceName,
          version: this.config.version,
          logs,
        }),
      });
    }
  }

  /**
   * 콘솔에 에러 출력 (개발 환경)
   */
  private logToConsole(entry: ErrorLogEntry): void {
    const color = this.getSeverityColor(entry.severity);
    const prefix = `[${entry.errorType}]`;

    console.group(
      `%c${prefix} ${entry.message}`,
      `color: ${color}; font-weight: bold`
    );
    console.log("Severity:", entry.severity);
    console.log("Timestamp:", entry.timestamp);

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log("Context:", entry.context);
    }

    if (entry.stack) {
      console.log("Stack:", entry.stack);
    }

    console.groupEnd();
  }

  /**
   * 심각도에 따른 색상
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case "fatal":
        return "#dc2626"; // red
      case "error":
        return "#ea580c"; // orange
      case "warning":
        return "#ca8a04"; // yellow
      case "info":
        return "#2563eb"; // blue
      default:
        return "#6b7280"; // gray
    }
  }

  /**
   * 디바이스 정보 수집
   */
  private getDeviceInfo() {
    if (typeof window === "undefined") {
      return {
        userAgent: "",
        platform: "server",
        language: "",
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  }

  /**
   * 자동 flush 시작
   */
  private startAutoFlush(intervalMs: number): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, intervalMs);
  }

  /**
   * 자동 flush 중지
   */
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  setUser(userId?: string): void {
    this.config.userId = userId;
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.stopAutoFlush();
    this.flush();
  }
}

// ============================================================================
// Global Logger Instance
// ============================================================================

let globalLogger: ErrorLogger | null = null;

/**
 * 전역 로거 초기화
 */
export function initErrorLogger(config: ErrorLoggerConfig): ErrorLogger {
  globalLogger = new ErrorLogger(config);
  return globalLogger;
}

/**
 * 전역 로거 가져오기
 */
export function getErrorLogger(): ErrorLogger {
  if (!globalLogger) {
    throw new Error(
      "Error logger not initialized. Call initErrorLogger first."
    );
  }
  return globalLogger;
}

/**
 * 에러 로깅 (편의 함수)
 */
export function logError(
  error: BaseError,
  context?: Record<string, any>
): void {
  if (globalLogger) {
    globalLogger.log(error, context);
  } else {
    console.error("Error logger not initialized:", error);
  }
}
