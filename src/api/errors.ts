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
