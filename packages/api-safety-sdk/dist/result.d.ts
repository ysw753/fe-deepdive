import { AppError } from './errors';
export type Ok<T> = {
    ok: true;
    data: T;
};
export type Err<E> = {
    ok: false;
    error: E;
};
export type Result<T, E = unknown> = Ok<T> | Err<E>;
export declare const ok: <T>(data: T) => Ok<T>;
export declare const err: <E>(error: E) => Err<E>;
export declare const map: <T, U, E>(r: Result<T, E>, f: (t: T) => U) => Result<U, E>;
export declare const mapError: <T, E, F>(r: Result<T, E>, f: (e: E) => F) => Result<T, F>;
export declare const isOk: <T, E>(r: Result<T, E>) => r is Ok<T>;
export declare const isErr: <T, E>(r: Result<T, E>) => r is Err<E>;
export declare const andThen: <T, U, E>(r: Result<T, E>, f: (t: T) => Result<U, E>) => Result<U, E>;
export declare const andThenAsync: <T, U, E>(r: Result<T, E>, f: (t: T) => Promise<Result<U, E>>) => Promise<Result<U, E>>;
export type ApiResult<T> = Result<T, AppError>;
