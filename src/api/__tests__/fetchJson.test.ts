import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { fetchJson } from '../fetchJson';

// 헬퍼: Response 생성
const jsonRes = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...(init ?? {}),
  });

const textRes = (text: string, init?: ResponseInit) =>
  new Response(text, {
    status: 200,
    headers: { 'content-type': 'text/plain' },
    ...(init ?? {}),
  });

const httpErrRes = (status: number, body: unknown, ct = 'application/json') =>
  new Response(ct === 'application/json' ? JSON.stringify(body) : String(body), {
    status,
    headers: { 'content-type': ct },
  });

describe('fetchJson', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
  });

  it('✅ 스키마 없이 성공(JSON) → ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonRes({ id: 1, name: 'Lee' })));

    const r = await fetchJson<{ id: number; name: string }>('/users/1');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.id).toBe(1);
      expect(r.data.name).toBe('Lee');
    }
  });

  it('✅ parse: "text" 성공 → ok(string)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(textRes('hello')));

    const r = await fetchJson<string>('/ping', { parse: 'text' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe('hello');
  });

  it('✅ 스키마 검증 성공 → ok(추론 타입)', async () => {
    const User = z.object({ id: z.number().int(), name: z.string().min(1) });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonRes({ id: 7, name: 'Kim' })));

    const r = await fetchJson('/users/7', { schema: User });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.id).toBe(7);
  });

  it('❌ 스키마 검증 실패 → ValidationError', async () => {
    const User = z.object({ id: z.number().int(), name: z.string().min(1) });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonRes({ id: 1, name: '' })));

    const r = await fetchJson('/users/1', { schema: User });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('ValidationError');
      // issues 평탄화 확인
      // @ts-expect-error narrow
      expect(r.error.issues?.length).toBeGreaterThan(0);
      // @ts-expect-error narrow
      expect(r.error.message).toBe('응답 스키마가 기대와 달라.');
    }
  });

  it('❌ HTTP 에러 → HttpError(status, body 포함)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(httpErrRes(404, { error: 'NotFound' })));

    const r = await fetchJson('/users/999');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('HttpError');
      // @ts-expect-error narrow
      expect(r.error.status).toBe(404);
      // @ts-expect-error narrow
      expect(r.error.body).toEqual({ error: 'NotFound' });
    }
  });

  it('❌ ParseError (content-type: application/json인데 JSON 깨짐)', async () => {
    const bad = new Response('not-json', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(bad));

    const r = await fetchJson('/weird-json');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('ParseError');
      // @ts-expect-error narrow
      expect(typeof r.error.raw).toBe('string');
    }
  });

  it('⏳ Timeout → TimeoutError(timeoutMs 일치)', async () => {
    vi.useFakeTimers();

    // fetch가 signal abort될 때 AbortError로 reject되도록 모킹
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        signal?.addEventListener('abort', () => {
          const err = new Error('timeout');
          (err as any).name = 'AbortError';
          (err as any).message = 'timeout';
          reject(err);
        });
        // 절대 resolve/reject 안 하고 abort만 기다림
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchJson('/slow', { timeoutMs: 5 });
    await vi.advanceTimersByTimeAsync(6);
    const r = await promise;

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('TimeoutError');
      // @ts-expect-error narrow
      expect(r.error.timeoutMs).toBe(5);
    }
    vi.useRealTimers();
  });
});
