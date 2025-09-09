// ---------- factories (일관된 메시지/필드 세팅) ----------
export const makeNetworkError = (cause, message = '네트워크 연결 실패') => ({
    kind: 'NetworkError',
    message,
    cause,
});
export const makeTimeoutError = (timeoutMs, message = '요청 시간 초과') => ({
    kind: 'TimeoutError',
    message,
    timeoutMs,
});
export const makeHttpError = (status, statusText, body, message = '서버 오류 상태') => ({
    kind: 'HttpError',
    status,
    statusText,
    body,
});
export const makeParseError = (raw, cause, message = '응답 파싱 실패') => ({
    kind: 'ParseError',
    message,
    raw,
    cause,
});
export const makeValidationError = (issues, message = '응답 스키마 불일치') => ({
    kind: 'ValidationError',
    message,
    issues,
});
// ---------- type guards (선택) ----------
export const isNetworkError = (e) => e.kind === 'NetworkError';
export const isTimeoutError = (e) => e.kind === 'TimeoutError';
export const isHttpError = (e) => e.kind === 'HttpError';
export const isParseError = (e) => e.kind === 'ParseError';
export const isValidationError = (e) => e.kind === 'ValidationError';
