import { describe, it, expect } from 'vitest';

import { errorToMessage, parseFieldErrors, type AppError } from 'api-safety-sdk';

describe('errorToMessage', () => {
  it('ValidationError → 첫 이슈 메시지 우선', () => {
    const err: AppError = {
      kind: 'ValidationError',
      message: '응답 스키마 불일치',
      issues: [{ path: 'token', message: 'token 누락' }],
    };
    expect(errorToMessage(err)).toContain('token 누락');
  });

  it('HttpError(body.message) 포함', () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 409,
      statusText: 'Conflict',
      body: { message: '이미 존재' },
    };
    expect(errorToMessage(err)).toContain('HTTP 409');
    expect(errorToMessage(err)).toContain('이미 존재');
  });

  it('Parse/Network/Timeout 기본 메시지', () => {
    expect(errorToMessage({ kind: 'ParseError', message: '파싱 실패', raw: '' })).toContain('파싱');
    expect(
      errorToMessage({ kind: 'NetworkError', message: '네트워크', cause: undefined })
    ).toContain('네트워크');
    expect(errorToMessage({ kind: 'TimeoutError', message: '시간 초과', timeoutMs: 1 })).toContain(
      '시간'
    );
  });
});

describe('parseFieldErrors', () => {
  it('fieldErrors 객체', () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 422,
      statusText: '',
      body: { fieldErrors: { email: '이미 사용 중' } },
    };
    expect(parseFieldErrors(err)).toEqual({ email: '이미 사용 중' });
  });

  it('errors: 배열 값', () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 422,
      statusText: '',
      body: { errors: { password: ['너무 짧음'] } },
    };
    expect(parseFieldErrors(err)).toEqual({ password: '너무 짧음' });
  });

  it('details: [{ path, message }]', () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 422,
      statusText: '',
      body: { details: [{ path: 'email', message: '형식 아님' }] },
    };
    expect(parseFieldErrors(err)).toEqual({ email: '형식 아님' });
  });

  it("zod issues: [{ path: ['email'], message }]", () => {
    const err: AppError = {
      kind: 'HttpError',
      status: 422,
      statusText: '',
      body: { issues: [{ path: ['email'], message: '형식 아님' }] },
    };
    expect(parseFieldErrors(err)).toEqual({ email: '형식 아님' });
  });
});
