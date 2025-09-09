import { AppError } from './errors';

// 성공/실패를 명시하는 Result 패턴
export type Ok<T> = { ok: true; data: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = unknown> = Ok<T> | Err<E>;

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// 체이닝을 위한 헬퍼 (선택)
export const map = <T, U, E>(r: Result<T, E>, f: (t: T) => U): Result<U, E> =>
  r.ok ? ok(f(r.data)) : r;

export const mapError = <T, E, F>(r: Result<T, E>, f: (e: E) => F): Result<T, F> =>
  r.ok ? r : err(f(r.error));

// (선택) 타입가드/flatMap
export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok;

export const andThen = <T, U, E>(r: Result<T, E>, f: (t: T) => Result<U, E>): Result<U, E> =>
  r.ok ? f(r.data) : (r as Err<E>);

export const andThenAsync = async <T, U, E>(
  r: Result<T, E>,
  f: (t: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> => (r.ok ? f(r.data) : (r as Err<E>));

// API 전용 별칭
export type ApiResult<T> = Result<T, AppError>;
