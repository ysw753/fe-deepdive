import { describe, it, expect, vi } from 'vitest';
import { applyFormError } from 'api-safety-sdk';
import type { AppError } from 'api-safety-sdk';

type DummyForm = { email: string; password: string };

describe('applyFormError (RHF 어댑터)', () => {
  it('HTTP 400 → password 필드로 매핑', () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 400,
      statusText: 'Bad Request',
      body: { message: 'Invalid credentials' },
    };

    const setError = vi.fn();
    const setFocus = vi.fn();
    const setServerError = vi.fn();

    applyFormError<DummyForm>(err, {
      setError,
      setFocus,
      statusFieldMap: { 400: 'password', 401: 'password' },
      setServerError,
    });

    expect(setError).toHaveBeenCalledWith(
      'password',
      expect.objectContaining({ type: 'server', message: expect.stringContaining('HTTP 400') })
    );
    expect(setFocus).toHaveBeenCalledWith('password');
    expect(setServerError).not.toHaveBeenCalled();
  });

  it('422 fieldErrors → 각 필드 setError', () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 422,
      statusText: 'Unprocessable Entity',
      body: { fieldErrors: { email: '이미 사용 중', password: '너무 짧음' } },
    };

    const setError = vi.fn();
    const setFocus = vi.fn();
    const setServerError = vi.fn();

    applyFormError<DummyForm>(err, { setError, setFocus, setServerError });

    expect(setError).toHaveBeenCalledWith(
      'email',
      expect.objectContaining({ message: '이미 사용 중' })
    );
    expect(setError).toHaveBeenCalledWith(
      'password',
      expect.objectContaining({ message: '너무 짧음' })
    );
    expect(setFocus).toHaveBeenCalledWith('email'); // 첫 에러 필드로 포커스
    expect(setServerError).not.toHaveBeenCalled();
  });

  it('TimeoutError → 전역 서버 에러 메시지', () => {
    const err: AppError = { kind: 'TimeoutError', message: '요청 시간 초과', timeoutMs: 5000 };

    const setError = vi.fn();
    const setFocus = vi.fn();
    const setServerError = vi.fn();

    applyFormError<DummyForm>(err, { setError, setFocus, setServerError });

    expect(setServerError).toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
    expect(setFocus).not.toHaveBeenCalled();
  });
});
