import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchJson } from '../fetchJson';
import { z } from 'zod';
import { AppError } from '../errors';

const UserSchema = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof UserSchema>;

beforeEach(() => {
  vi.resetAllMocks();
  // @ts-expect-error — 테스트 환경에 fetch 주입
  global.fetch = vi.fn();
});

describe('fetchJson', () => {
  it('성공: 200 + JSON + 검증 통과', async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'Alice' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await fetchJson<User>('/api/users/1', { schema: UserSchema });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe(1);
    }
  });

  it('HTTP 에러: 500', async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'server down' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        statusText: 'Internal Server Error',
      })
    );

    const res = await fetchJson<User>('/api/users/1', { schema: UserSchema });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      const e = res.error as AppError;
      expect(e.kind).toBe('HttpError');
      expect(e.status).toBe(500);
    }
  });

  it('파싱 실패: JSON 아님 → ParseError', async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce(
      new Response('<html></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
    );

    const res = await fetchJson<User>('/api/users/1', { schema: UserSchema });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      const e = res.error as AppError;
      expect(e.kind).toBe('ParseError'); // ✅ 리팩토링 후엔 ParseError가 정확히 떨어짐
      // raw 본문도 선택적으로 점검 가능:
      // @ts-expect-error
      expect((e as any).raw).toContain('<html>');
    }
  });

  it('타임아웃: AbortSignal을 존중하는 mock으로 재현', async () => {
    // abort를 들으면 AbortError로 reject하는 fetch mock
    // @ts-expect-error
    global.fetch.mockImplementationOnce((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined;

        const rejectAbort = () => {
          const err: any = new Error('timeout');
          err.name = 'AbortError';
          err.message = 'timeout';
          reject(err);
        };

        // 이미 abort 상태면 즉시 실패
        if (signal?.aborted) {
          rejectAbort();
          return;
        }
        // 이후 abort 이벤트를 구독
        signal?.addEventListener('abort', rejectAbort);
        // resolve는 호출하지 않음 → abort가 유일한 탈출구
      });
    });

    const res = await fetchJson<User>('/api/users/1', {
      schema: UserSchema,
      timeoutMs: 20, // 짧게
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      const e = res.error as AppError;
      expect(['TimeoutError', 'NetworkError']).toContain(e.kind);
    }
  }, 500); // 이 테스트 자체 타임아웃도 짧게

  it('검증 실패: 필드 누락 → ValidationError', async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const res = await fetchJson<User>('/api/users/1', { schema: UserSchema });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      const e = res.error as AppError;
      expect(e.kind).toBe('ValidationError');
      // e.issues로 상세 경로/메시지 확인 가능
      expect((e as any).issues?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
