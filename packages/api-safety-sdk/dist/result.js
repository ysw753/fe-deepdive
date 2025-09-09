export const ok = (data) => ({ ok: true, data });
export const err = (error) => ({ ok: false, error });
// 체이닝을 위한 헬퍼 (선택)
export const map = (r, f) => r.ok ? ok(f(r.data)) : r;
export const mapError = (r, f) => r.ok ? r : err(f(r.error));
// (선택) 타입가드/flatMap
export const isOk = (r) => r.ok;
export const isErr = (r) => !r.ok;
export const andThen = (r, f) => r.ok ? f(r.data) : r;
export const andThenAsync = async (r, f) => (r.ok ? f(r.data) : r);
