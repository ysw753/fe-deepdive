import type { AppError } from './errors';
/** 에러 kind별 커스텀 메시지 오버라이드 */
export type ErrorMessageMap = Partial<{
    NetworkError: (e: Extract<AppError, {
        kind: 'NetworkError';
    }>) => string | string;
    TimeoutError: (e: Extract<AppError, {
        kind: 'TimeoutError';
    }>) => string | string;
    ParseError: (e: Extract<AppError, {
        kind: 'ParseError';
    }>) => string | string;
    ValidationError: (e: Extract<AppError, {
        kind: 'ValidationError';
    }>) => string | string;
    HttpError: (e: Extract<AppError, {
        kind: 'HttpError';
    }>) => string | string;
    default: (e: AppError) => string | string;
}>;
/** 에러 → 사용자용 메시지(기본 문구 제공, map으로 i18n/커스터마이즈 가능) */
export declare function errorToMessage(err: AppError, map?: ErrorMessageMap): string;
/**
 * 422/400 등에서 서버가 내려준 필드 에러를 일반화해서 추출
 * - { fieldErrors: { email: '...', password: '...' } }
 * - { errors: { email: ['...'] } }
 * - { details: [{ path: 'email', message: '...' }] }
 * - { issues: [{ path: ['email'], message: '...' }] }  // zod
 */
export declare function parseFieldErrors(err: AppError): Record<string, string> | null;
