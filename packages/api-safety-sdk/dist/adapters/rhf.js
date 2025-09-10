import { errorToMessage, parseFieldErrors } from '../error-helpers';
/** RHF 폼에 AppError를 매핑 */
export function applyFormError(err, opts) {
    const { setError, setFocus, statusFieldMap, setServerError, messages } = opts;
    // 1) 서버가 필드 에러 제공
    const fields = parseFieldErrors(err);
    if (fields) {
        const keys = Object.keys(fields);
        for (const k of keys) {
            setError(k, { type: 'server', message: fields[k] });
        }
        if (keys[0])
            setFocus?.(keys[0]);
        return;
    }
    // 2) 상태 코드 → 특정 필드
    if (err.kind === 'HttpError') {
        const field = statusFieldMap?.[err.status];
        if (field) {
            setError(field, { type: 'server', message: errorToMessage(err, messages) });
            setFocus?.(field);
            return;
        }
    }
    // 3) 그 외 전역 에러
    setServerError?.(errorToMessage(err, messages));
}
