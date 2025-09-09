import { ZodSchema } from 'zod';
import { type Result } from './result';
import type { AppError } from './errors';
export type ParseMode = 'json' | 'text' | 'blob';
export type FetchJsonOptions<T> = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    jsonBody?: boolean;
    timeoutMs?: number;
    signal?: AbortSignal;
    parse?: ParseMode;
    schema?: ZodSchema<T>;
    credentials?: RequestCredentials;
};
export declare function fetchJson<T>(url: string, opts?: FetchJsonOptions<T>): Promise<Result<T, AppError>>;
