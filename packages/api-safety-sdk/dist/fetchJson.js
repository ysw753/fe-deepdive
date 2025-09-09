import { err, ok } from './result';
const DEFAULT_TIMEOUT = 10000;
export async function fetchJson(url, opts = {}) {
    const { method = 'GET', headers = {}, body, jsonBody = true, timeoutMs = DEFAULT_TIMEOUT, signal, parse = 'json', schema, credentials = 'include', } = opts;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
    const composedSignal = mergeSignals(signal, controller.signal);
    try {
        // 기본 Accept 헤더 추가(서버가 협상 가능하도록)
        const finalHeaders = {
            Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
            ...headers,
        };
        let finalBody;
        if (body !== undefined) {
            if (jsonBody) {
                finalHeaders['Content-Type'] ?? (finalHeaders['Content-Type'] = 'application/json');
                finalBody = JSON.stringify(body);
            }
            else {
                finalBody = body;
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
            return err({
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
                return err({
                    kind: 'ValidationError',
                    message: '응답 스키마가 기대와 달라.',
                    issues,
                });
            }
            return ok(check.data);
        }
        return ok(parsed);
    }
    catch (e) {
        // JSON 파싱 실패를 명확히 구분
        if (e?.name === 'ParseError') {
            return err({
                kind: 'ParseError',
                message: 'JSON 파싱에 실패했어.',
                raw: e.raw ?? '',
                cause: e.cause,
            });
        }
        if (e?.name === 'AbortError') {
            // timeout 사유로 abort된 케이스
            if (e?.message === 'timeout' || e === 'timeout') {
                return err({
                    kind: 'TimeoutError',
                    message: '요청이 시간 제한을 초과했어.',
                    timeoutMs,
                });
            }
            // 이 외 abort는 네트워크로 분류
            return err({
                kind: 'NetworkError',
                message: '요청이 중단되었어.',
                cause: e,
            });
        }
        // 그 외 fetch 단계 에러(네트워크 등)
        return err({
            kind: 'NetworkError',
            message: '네트워크 요청에 실패했어.',
            cause: e,
        });
    }
    finally {
        clearTimeout(timer);
    }
}
/** 응답 바디 안전 파싱(JSON 우선, 실패 시 text로 폴백) */
async function safeReadBody(res) {
    const ct = res.headers.get('content-type') ?? '';
    try {
        if (ct.includes('application/json')) {
            return await res.json();
        }
        return await res.text();
    }
    catch {
        // 파싱 실패 시 원문 텍스트로 재시도
        try {
            return await res.text();
        }
        catch {
            return undefined;
        }
    }
}
/** 정상 응답 바디 파싱 */
async function parseBody(res, mode) {
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
            }
            catch (e) {
                // 원본에서 텍스트를 읽어 raw 확보 → ParseError로 승격
                const raw = await res.text().catch(() => '');
                throw { name: 'ParseError', raw, cause: e };
            }
        }
    }
}
/** 외부 AbortSignal과 내부 타이머 signal을 결합 */
function mergeSignals(external, internal) {
    if (!external)
        return internal;
    if (!internal)
        return external;
    const controller = new AbortController();
    const onAbort = (s) => {
        if (!controller.signal.aborted)
            controller.abort(s.reason);
    };
    external.addEventListener('abort', () => onAbort(external));
    internal.addEventListener('abort', () => onAbort(internal));
    return controller.signal;
}
