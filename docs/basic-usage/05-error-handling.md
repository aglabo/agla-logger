---
header:
  - src: 04-error-handling.md
  - @(#): Error Handling
title: エラーハンドリング
description: AgLoggerError を使用したエラーハンドリングと効果的なエラーログ活用法
version: 1.0.0
created: 2025-09-20
authors:
  - atsushifx
changes:
  - 2025-09-20: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## エラーハンドリング

このセクションでは、効果的なエラーハンドリングについて詳しく解説します。
`AgLoggerError` を使用したエラーハンドリング、構造化エラーログ、エラー分類とログレベルの自動選択など、実践的なエラー管理手法を学べます。

---

## AgLoggerError を使用したエラーハンドリング

### 基本的な AgLoggerError 使用方法

```typescript
import { AgLoggerError, ErrorSeverity } from '@aglabo/agla-logger';
import { AgLogger, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// AgLoggerError を使用したエラーハンドリング
function processUserData(userData: UserData) {
  try {
    validateUserData(userData);
    const result = saveUserData(userData);

    logger.info('ユーザーデータ処理成功', {
      userId: userData.id,
      operation: 'save',
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    // AgLoggerError でエラーを標準化
    const agLoggerError = new AgLoggerError(
      ErrorSeverity.ERROR,
      'USER_DATA_PROCESSING_FAILED',
      'ユーザーデータの処理に失敗しました',
      {
        userId: userData.id,
        originalError: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
      },
    );

    // エラーの重要度に応じたログレベル選択
    logAgLoggerError(agLoggerError);
    throw agLoggerError;
  }
}

// AgLoggerError のログ出力関数
function logAgLoggerError(error: AgLoggerError): void {
  const errorLog = {
    errorCode: error.code,
    message: error.message,
    context: error.context,
    severity: error.severity,
    timestamp: new Date().toISOString(),
  };

  switch (error.severity) {
    case ErrorSeverity.FATAL:
      logger.fatal('致命的エラー', errorLog);
      break;
    case ErrorSeverity.ERROR:
      logger.error('エラー', errorLog);
      break;
    case ErrorSeverity.WARNING:
      logger.warn('警告', errorLog);
      break;
    case ErrorSeverity.INFO:
      logger.info('情報', errorLog);
      break;
    default:
      logger.error('未分類エラー', errorLog);
  }
}
```

### エラーコンテキストの活用

```typescript
// 詳細なコンテキスト情報を含むエラー処理
async function handleAPIRequest(request: APIRequest): Promise<APIResponse> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.info('API リクエスト開始', {
      requestId,
      method: request.method,
      endpoint: request.endpoint,
      userId: request.userId,
    });

    const response = await processAPIRequest(request);
    const duration = Date.now() - startTime;

    logger.info('API リクエスト成功', {
      requestId,
      statusCode: response.statusCode,
      duration: `${duration}ms`,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // エラータイプに応じた AgLoggerError 作成
    let agLoggerError: AgLoggerError;

    if (error instanceof ValidationError) {
      agLoggerError = new AgLoggerError(
        ErrorSeverity.WARNING,
        'API_VALIDATION_ERROR',
        'API リクエストの検証に失敗しました',
        {
          requestId,
          endpoint: request.endpoint,
          validationErrors: error.errors,
          duration: `${duration}ms`,
        },
      );
    } else if (error instanceof NetworkError) {
      agLoggerError = new AgLoggerError(
        ErrorSeverity.ERROR,
        'API_NETWORK_ERROR',
        'ネットワークエラーが発生しました',
        {
          requestId,
          endpoint: request.endpoint,
          networkError: error.message,
          duration: `${duration}ms`,
        },
      );
    } else {
      agLoggerError = new AgLoggerError(
        ErrorSeverity.FATAL,
        'API_UNKNOWN_ERROR',
        '予期しないエラーが発生しました',
        {
          requestId,
          endpoint: request.endpoint,
          originalError: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          duration: `${duration}ms`,
        },
      );
    }

    logAgLoggerError(agLoggerError);
    throw agLoggerError;
  }
}
```

---

## 構造化エラーログ

### エラー情報の標準化

```typescript
// エラーログの標準化インターフェース
interface StandardErrorLog {
  errorId: string;
  errorType: string;
  message: string;
  timestamp: string;
  context: {
    operation: string;
    userId?: string;
    requestId?: string;
    sessionId?: string;
  };
  technical: {
    stack?: string;
    file?: string;
    line?: number;
    function?: string;
  };
  business: {
    impact: 'low' | 'medium' | 'high' | 'critical';
    recovery: string;
  };
}

// 構造化エラーログ作成関数
function createStructuredErrorLog(
  error: Error,
  context: Partial<StandardErrorLog['context']>,
  businessContext?: Partial<StandardErrorLog['business']>,
): StandardErrorLog {
  const errorId = generateErrorId();

  return {
    errorId,
    errorType: error.constructor.name,
    message: error.message,
    timestamp: new Date().toISOString(),
    context: {
      operation: 'unknown',
      ...context,
    },
    technical: {
      stack: error.stack,
      file: extractFileFromStack(error.stack),
      line: extractLineFromStack(error.stack),
      function: extractFunctionFromStack(error.stack),
    },
    business: {
      impact: 'medium',
      recovery: 'retry_operation',
      ...businessContext,
    },
  };
}

// 使用例
function processPayment(paymentData: PaymentData): PaymentResult {
  try {
    return executePayment(paymentData);
  } catch (error) {
    const structuredLog = createStructuredErrorLog(
      error as Error,
      {
        operation: 'payment_processing',
        userId: paymentData.userId,
        requestId: paymentData.requestId,
      },
      {
        impact: 'high',
        recovery: 'manual_review_required',
      },
    );

    logger.error('決済処理エラー', structuredLog);
    throw error;
  }
}
```

### エラー集約とレポート

```typescript
// エラー統計情報の収集
class ErrorAggregator {
  private errorCounts = new Map<string, number>();
  private errorSamples = new Map<string, StandardErrorLog[]>();
  private logger: AgLogger;

  constructor() {
    this.logger = AgLogger.createLogger({
      defaultLogger: ConsoleLogger,
      formatter: JsonFormatter,
    });
  }

  logError(error: Error, context: any): void {
    const errorType = error.constructor.name;

    // エラー回数をカウント
    const currentCount = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, currentCount + 1);

    // エラーサンプルを保存（最大5件）
    const structuredLog = createStructuredErrorLog(error, context);
    const samples = this.errorSamples.get(errorType) || [];

    if (samples.length < 5) {
      samples.push(structuredLog);
      this.errorSamples.set(errorType, samples);
    }

    // 通常のエラーログ
    this.logger.error('エラー発生', structuredLog);

    // 一定回数に達したら警告
    if (currentCount > 0 && currentCount % 10 === 0) {
      this.logger.warn('繰り返しエラー検出', {
        errorType,
        count: currentCount,
        samples: samples.slice(0, 3), // 最初の3件のサンプル
      });
    }
  }

  generateErrorReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrorTypes: this.errorCounts.size,
        totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      },
      errorBreakdown: Array.from(this.errorCounts.entries()).map(([type, count]) => ({
        errorType: type,
        count,
        samples: this.errorSamples.get(type)?.slice(0, 2) || [],
      })),
    };

    this.logger.info('エラーレポート', report);
  }
}

// グローバルエラーハンドラーでの使用
const errorAggregator = new ErrorAggregator();

process.on('uncaughtException', (error) => {
  errorAggregator.logError(error, {
    operation: 'uncaught_exception',
    context: 'global_handler',
  });
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  errorAggregator.logError(error, {
    operation: 'unhandled_rejection',
    context: 'promise_rejection',
  });
});
```

---

## エラー分類とログレベル自動選択

### エラータイプベースの分類

```typescript
// カスタムエラークラス定義
class ValidationError extends Error {
  constructor(message: string, public field: string, public value: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

class BusinessLogicError extends Error {
  constructor(message: string, public code: string, public severity: 'low' | 'medium' | 'high') {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

class SystemError extends Error {
  constructor(message: string, public systemComponent: string) {
    super(message);
    this.name = 'SystemError';
  }
}

class SecurityError extends Error {
  constructor(message: string, public securityContext: any) {
    super(message);
    this.name = 'SecurityError';
  }
}

// エラータイプに応じたログレベル自動選択
function logErrorByType(error: Error, context: any = {}): void {
  const baseLog = {
    errorType: error.constructor.name,
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof ValidationError) {
    logger.warn('バリデーションエラー', {
      ...baseLog,
      field: error.field,
      value: error.value,
      severity: 'warning',
    });
  } else if (error instanceof BusinessLogicError) {
    const logLevel = error.severity === 'high' ? 'error' : 'warn';
    logger[logLevel]('ビジネスロジックエラー', {
      ...baseLog,
      code: error.code,
      severity: error.severity,
    });
  } else if (error instanceof SystemError) {
    logger.error('システムエラー', {
      ...baseLog,
      systemComponent: error.systemComponent,
      severity: 'error',
    });
  } else if (error instanceof SecurityError) {
    logger.fatal('セキュリティエラー', {
      ...baseLog,
      securityContext: error.securityContext,
      severity: 'critical',
    });
  } else if (error instanceof TypeError || error instanceof ReferenceError) {
    logger.fatal('プログラムエラー', {
      ...baseLog,
      stack: error.stack,
      severity: 'critical',
    });
  } else {
    logger.error('予期しないエラー', {
      ...baseLog,
      stack: error.stack,
      severity: 'error',
    });
  }
}

// 使用例
function processUserInput(input: UserInput): ProcessResult {
  try {
    // バリデーション
    if (!input.email || !isValidEmail(input.email)) {
      throw new ValidationError('無効なメールアドレス', 'email', input.email);
    }

    // ビジネスロジック
    if (input.age < 18) {
      throw new BusinessLogicError('未成年は登録できません', 'AGE_RESTRICTION', 'medium');
    }

    // システム処理
    const result = saveToDatabase(input);
    return result;
  } catch (error) {
    logErrorByType(error as Error, {
      operation: 'user_input_processing',
      inputData: { ...input, password: '***' }, // パスワードをマスク
    });
    throw error;
  }
}
```

### エラー頻度ベースの動的ログレベル

```typescript
// エラー頻度監視とログレベル調整
class AdaptiveErrorLogger {
  private errorFrequency = new Map<string, number[]>();
  private logger: AgLogger;
  private readonly timeWindow = 60000; // 1分間のウィンドウ
  private readonly highFrequencyThreshold = 10; // 1分間に10回以上でhigh frequency

  constructor() {
    this.logger = AgLogger.createLogger({
      defaultLogger: ConsoleLogger,
      formatter: JsonFormatter,
    });
  }

  logError(error: Error, context: any = {}): void {
    const errorKey = `${error.constructor.name}:${error.message}`;
    const now = Date.now();

    // エラー発生時刻を記録
    if (!this.errorFrequency.has(errorKey)) {
      this.errorFrequency.set(errorKey, []);
    }

    const timestamps = this.errorFrequency.get(errorKey)!;
    timestamps.push(now);

    // 古いタイムスタンプを削除
    const cutoff = now - this.timeWindow;
    const recentTimestamps = timestamps.filter((ts) => ts > cutoff);
    this.errorFrequency.set(errorKey, recentTimestamps);

    // 頻度に応じたログレベル決定
    const frequency = recentTimestamps.length;
    const isHighFrequency = frequency >= this.highFrequencyThreshold;

    const logData = {
      errorType: error.constructor.name,
      message: error.message,
      context,
      frequency: {
        count: frequency,
        timeWindow: `${this.timeWindow}ms`,
        isHighFrequency,
      },
      timestamp: new Date().toISOString(),
    };

    if (isHighFrequency) {
      // 高頻度エラーは警告レベルに下げる（ログの氾濫を防ぐ）
      this.logger.warn('高頻度エラー検出', logData);
    } else if (error instanceof SecurityError) {
      this.logger.fatal('セキュリティエラー', logData);
    } else if (error instanceof SystemError) {
      this.logger.error('システムエラー', logData);
    } else {
      this.logger.error('エラー', logData);
    }
  }

  getErrorFrequencyReport(): any {
    const now = Date.now();
    const cutoff = now - this.timeWindow;

    const report = Array.from(this.errorFrequency.entries()).map(([errorKey, timestamps]) => {
      const recentCount = timestamps.filter((ts) => ts > cutoff).length;
      return {
        errorKey,
        recentCount,
        isHighFrequency: recentCount >= this.highFrequencyThreshold,
      };
    }).filter((item) => item.recentCount > 0);

    return {
      timestamp: new Date().toISOString(),
      timeWindow: `${this.timeWindow}ms`,
      errors: report,
    };
  }
}

// 使用例
const adaptiveLogger = new AdaptiveErrorLogger();

// 定期的なエラー頻度レポート
setInterval(() => {
  const report = adaptiveLogger.getErrorFrequencyReport();
  if (report.errors.length > 0) {
    logger.info('エラー頻度レポート', report);
  }
}, 300000); // 5分ごと
```

---

## 実践的なエラー処理パターン

### リトライ機能付きエラーハンドリング

```typescript
// リトライ機能付きの操作実行
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    delayMs: number;
    operationName: string;
    context?: any;
  },
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      const result = await operation();

      if (attempt > 1) {
        logger.info('操作成功（リトライ後）', {
          operation: options.operationName,
          attempt,
          context: options.context,
        });
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt < options.maxRetries) {
        logger.warn('操作失敗（リトライ予定）', {
          operation: options.operationName,
          attempt,
          maxRetries: options.maxRetries,
          error: lastError.message,
          nextRetryIn: `${options.delayMs}ms`,
          context: options.context,
        });

        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      } else {
        logger.error('操作失敗（リトライ上限到達）', {
          operation: options.operationName,
          totalAttempts: attempt,
          finalError: lastError.message,
          context: options.context,
        });
      }
    }
  }

  throw lastError!;
}

// 使用例
async function fetchUserData(userId: string): Promise<UserData> {
  return executeWithRetry(
    () => userService.fetchUser(userId),
    {
      maxRetries: 3,
      delayMs: 1000,
      operationName: 'fetch_user_data',
      context: { userId },
    },
  );
}
```

### サーキットブレーカーパターン

```typescript
// サーキットブレーカー実装
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly timeoutMs: number = 60000,
    private readonly operationName: string = 'unknown',
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = 'HALF_OPEN';
        logger.info('サーキットブレーカー半開状態', {
          operation: this.operationName,
          state: this.state,
        });
      } else {
        const error = new Error('サーキットブレーカーが開いています');
        logger.warn('サーキットブレーカー実行拒否', {
          operation: this.operationName,
          state: this.state,
          failures: this.failures,
        });
        throw error;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';

    logger.debug('サーキットブレーカー操作成功', {
      operation: this.operationName,
      state: this.state,
    });
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.error('サーキットブレーカー開放', {
        operation: this.operationName,
        state: this.state,
        failures: this.failures,
        threshold: this.failureThreshold,
      });
    } else {
      logger.warn('サーキットブレーカー失敗カウント', {
        operation: this.operationName,
        failures: this.failures,
        threshold: this.failureThreshold,
      });
    }
  }
}

// 使用例
const databaseCircuitBreaker = new CircuitBreaker(5, 60000, 'database_operation');

async function getUserFromDatabase(userId: string): Promise<User> {
  return databaseCircuitBreaker.execute(async () => {
    return await database.users.findById(userId);
  });
}
```

---

### See Also

- [ロガー詳細](04-logger-details.md)
- [プラグインシステム](06-plugin-system.md)
- [目次](README.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
