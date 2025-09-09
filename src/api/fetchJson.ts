import { ZodSchema } from 'zod';
import { err, ok, type Result } from './result';
import type { AppError } from './errors';

export type ParseMode = 'json' | 'text' | 'blob';

export type FetchJsonOptions<T> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown; // 자동 JSON.stringify 여부는 jsonBody로 제어
  jsonBody?: boolean; // true면 body를 JSON.stringify + content-type 설정
  timeoutMs?: number; // 기본 10초
  signal?: AbortSignal; // 외부 AbortController와 연동
  parse?: ParseMode; // 기본 'json'
  schema?: ZodSchema<T>; // 제공 시 런타임 검증
  credentials?: RequestCredentials; // 기본 'include' 유지 가능
};

const DEFAULT_TIMEOUT = 10_000;

export async function fetchJson<T>(
  url: string,
  opts: FetchJsonOptions<T> = {}
): Promise<Result<T, AppError>> {
  const {
    method = 'GET',
    headers = {},
    body,
    jsonBody = true,
    timeoutMs = DEFAULT_TIMEOUT,
    signal,
    parse = 'json',
    schema,
    credentials = 'include',
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
  const composedSignal = mergeSignals(signal, controller.signal);

  try {
    // 기본 Accept 헤더 추가(서버가 협상 가능하도록)
    const finalHeaders: Record<string, string> = {
      Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
      ...headers,
    };

    let finalBody: BodyInit | undefined;
    if (body !== undefined) {
      if (jsonBody) {
        finalHeaders['Content-Type'] ??= 'application/json';
        finalBody = JSON.stringify(body);
      } else {
        finalBody = body as BodyInit;
      }
    }

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: composedSignal,
      credentials,
    });

    // HTTP 에러면 가능한 한 바디를 파싱해서 담아준다
    if (!res.ok) {
      const errorBody = await safeReadBody(res);
      return err<AppError>({
        kind: 'HttpError',
        status: res.status,
        statusText: res.statusText,
        body: errorBody,
      });
    }

    // 성공 응답 파싱
    const parsed = await parseBody(res, parse);

    // zod 스키마 검증(있을 때만)
    if (schema) {
      const check = schema.safeParse(parsed);
      if (!check.success) {
        const issues = check.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return err<AppError>({
          kind: 'ValidationError',
          message: '응답 스키마가 기대와 달라.',
          issues,
        });
      }
      return ok<T>(check.data);
    }

    return ok<T>(parsed as T);
  } catch (e: any) {
    // JSON 파싱 실패를 명확히 구분
    if (e?.name === 'ParseError') {
      return err<AppError>({
        kind: 'ParseError',
        message: 'JSON 파싱에 실패했어.',
        raw: e.raw ?? '',
        cause: e.cause,
      });
    }

    if (e?.name === 'AbortError') {
      // timeout 사유로 abort된 케이스
      if (e?.message === 'timeout' || e === 'timeout') {
        return err<AppError>({
          kind: 'TimeoutError',
          message: '요청이 시간 제한을 초과했어.',
          timeoutMs,
        });
      }
      // 이 외 abort는 네트워크로 분류
      return err<AppError>({
        kind: 'NetworkError',
        message: '요청이 중단되었어.',
        cause: e,
      });
    }

    // 그 외 fetch 단계 에러(네트워크 등)
    return err<AppError>({
      kind: 'NetworkError',
      message: '네트워크 요청에 실패했어.',
      cause: e,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** 응답 바디 안전 파싱(JSON 우선, 실패 시 text로 폴백) */
async function safeReadBody(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') ?? '';
  try {
    if (ct.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch {
    // 파싱 실패 시 원문 텍스트로 재시도
    try {
      return await res.text();
    } catch {
      return undefined;
    }
  }
}

/** 정상 응답 바디 파싱 */
async function parseBody(res: Response, mode: ParseMode): Promise<unknown> {
  switch (mode) {
    case 'text':
      return await res.text();
    case 'blob':
      return await res.blob();
    case 'json':
    default: {
      // clone으로 json 파싱 시도(실패해도 원본 보존)
      const clone = res.clone();
      try {
        return await clone.json();
      } catch (e: any) {
        // 원본에서 텍스트를 읽어 raw 확보 → ParseError로 승격
        const raw = await res.text().catch(() => '');
        throw { name: 'ParseError', raw, cause: e };
      }
    }
  }
}

/** 외부 AbortSignal과 내부 타이머 signal을 결합 */
function mergeSignals(external?: AbortSignal, internal?: AbortSignal): AbortSignal | undefined {
  if (!external) return internal;
  if (!internal) return external;

  const controller = new AbortController();
  const onAbort = (s: AbortSignal) => {
    if (!controller.signal.aborted) controller.abort(s.reason);
  };
  external.addEventListener('abort', () => onAbort(external));
  internal.addEventListener('abort', () => onAbort(internal));
  return controller.signal;
}
