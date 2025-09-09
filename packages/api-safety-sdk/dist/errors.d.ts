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
export declare const makeNetworkError: (cause?: unknown, message?: string) => NetworkError;
export declare const makeTimeoutError: (timeoutMs: number, message?: string) => TimeoutError;
export declare const makeHttpError: (status: number, statusText: string, body?: unknown, message?: string) => HttpError;
export declare const makeParseError: (raw: string, cause?: unknown, message?: string) => ParseError;
export declare const makeValidationError: (issues: ValidationIssue[], message?: string) => ValidationError;
export declare const isNetworkError: (e: AppError) => e is NetworkError;
export declare const isTimeoutError: (e: AppError) => e is TimeoutError;
export declare const isHttpError: (e: AppError) => e is HttpError;
export declare const isParseError: (e: AppError) => e is ParseError;
export declare const isValidationError: (e: AppError) => e is ValidationError;
