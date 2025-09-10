const defaults = {
    NetworkError: (e) => e.message ?? '네트워크 연결 실패',
    TimeoutError: (e) => e.message ?? `요청 시간 초과`,
    ParseError: (e) => e.message ?? '응답 파싱 실패',
    ValidationError: (e) => e.issues?.[0]?.message ?? e.message ?? '응답 스키마 불일치',
    HttpError: (e) => {
        const msg = httpBodyMessage(e.body) ?? e.statusText;
        return msg ? `HTTP ${e.status}: ${msg}` : `HTTP ${e.status}`;
    },
    default: () => '알 수 없는 오류가 발생했어요.',
};
/** 에러 → 사용자용 메시지(기본 문구 제공, map으로 i18n/커스터마이즈 가능) */
export function errorToMessage(err, map) {
    const m = { ...defaults, ...(map ?? {}) };
    switch (err.kind) {
        case 'NetworkError':
            return run(m.NetworkError, err);
        case 'TimeoutError':
            return run(m.TimeoutError, err);
        case 'ParseError':
            return run(m.ParseError, err);
        case 'ValidationError':
            return run(m.ValidationError, err);
        case 'HttpError':
            return run(m.HttpError, err);
        default:
            return run(m.default, err);
    }
}
function run(f, ...args) {
    return typeof f === 'function' ? f(...args) : f;
}
/** 서버 body에서 메시지 후보 뽑기 */
function httpBodyMessage(body) {
    if (!body)
        return;
    if (typeof body === 'string')
        return body;
    if (Array.isArray(body))
        return body.map(String).join(', ');
    if (typeof body === 'object') {
        const obj = body;
        const direct = obj.message ?? obj.error ?? obj.detail ?? obj.title ?? obj.msg;
        if (typeof direct === 'string')
            return direct;
        // Zod 오류 형태
        if (Array.isArray(obj.issues) && obj.issues[0]?.message) {
            return String(obj.issues[0].message);
        }
    }
    return;
}
/**
 * 422/400 등에서 서버가 내려준 필드 에러를 일반화해서 추출
 * - { fieldErrors: { email: '...', password: '...' } }
 * - { errors: { email: ['...'] } }
 * - { details: [{ path: 'email', message: '...' }] }
 * - { issues: [{ path: ['email'], message: '...' }] }  // zod
 */
export function parseFieldErrors(err) {
    if (err.kind !== 'HttpError')
        return null;
    const body = err.body;
    if (!body || typeof body !== 'object')
        return null;
    // 1) key-value 형태
    const kv = body.fieldErrors ?? body.errors;
    if (kv && typeof kv === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(kv)) {
            out[k] = Array.isArray(v) ? String(v[0]) : String(v);
        }
        if (Object.keys(out).length)
            return out;
    }
    // 2) details: [{ path, message }]
    if (Array.isArray(body.details)) {
        const out = {};
        for (const it of body.details) {
            if (!it)
                continue;
            const k = String(it.path ?? '');
            const m = String(it.message ?? '');
            if (k && m)
                out[k] = m;
        }
        if (Object.keys(out).length)
            return out;
    }
    // 3) zod issues: [{ path: ['field'], message }]
    if (Array.isArray(body.issues)) {
        const out = {};
        for (const it of body.issues) {
            const p = Array.isArray(it?.path) ? it.path.join('.') : (it?.path ?? '');
            const k = String(p);
            const m = String(it?.message ?? '');
            if (k && m)
                out[k] = m;
        }
        if (Object.keys(out).length)
            return out;
    }
    return null;
}
