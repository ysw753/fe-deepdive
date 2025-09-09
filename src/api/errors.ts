export type NetworkError = {
  kind: 'NetworkError';
  message: string;
  cause?: unknown;
};

export type TimeoutError = {
  kind: 'TimeoutError';
  message: string;
  timeoutMs: number;
};

export type HttpError = {
  kind: 'HttpError';
  status: number;
  statusText: string;
  // 서버가 보낸 에러 바디(가능하면 JSON, 아니면 text)
  body?: unknown;
};

export type ParseError = {
  kind: 'ParseError';
  message: string;
  raw: string;
  cause?: unknown;
};

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationError = {
  kind: 'ValidationError';
  message: string;
  issues: ValidationIssue[];
};

export type AppError = NetworkError | TimeoutError | HttpError | ParseError | ValidationError;

// ---------- factories (일관된 메시지/필드 세팅) ----------

export const makeNetworkError = (
  cause?: unknown,
  message = '네트워크 연결 실패'
): NetworkError => ({
  kind: 'NetworkError',
  message,
  cause,
});

export const makeTimeoutError = (timeoutMs: number, message = '요청 시간 초과'): TimeoutError => ({
  kind: 'TimeoutError',
  message,
  timeoutMs,
});

export const makeHttpError = (
  status: number,
  statusText: string,
  body?: unknown,
  message = '서버 오류 상태'
): HttpError => ({
  kind: 'HttpError',
  status,
  statusText,
  body,
});

export const makeParseError = (
  raw: string,
  cause?: unknown,
  message = '응답 파싱 실패'
): ParseError => ({
  kind: 'ParseError',
  message,
  raw,
  cause,
});

export const makeValidationError = (
  issues: ValidationIssue[],
  message = '응답 스키마 불일치'
): ValidationError => ({
  kind: 'ValidationError',
  message,
  issues,
});

// ---------- type guards (선택) ----------

export const isNetworkError = (e: AppError): e is NetworkError => e.kind === 'NetworkError';
export const isTimeoutError = (e: AppError): e is TimeoutError => e.kind === 'TimeoutError';
export const isHttpError = (e: AppError): e is HttpError => e.kind === 'HttpError';
export const isParseError = (e: AppError): e is ParseError => e.kind === 'ParseError';
export const isValidationError = (e: AppError): e is ValidationError =>
  e.kind === 'ValidationError';
