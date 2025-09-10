import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { AppError } from '../errors';
import { errorToMessage, parseFieldErrors, type ErrorMessageMap } from '../error-helpers';

export type ApplyFormErrorOptions<T extends FieldValues> = {
  setError: UseFormSetError<T>;
  setFocus?: (name: Path<T>) => void;
  /** HTTP status → 특정 필드 매핑(예: {400:'password', 409:'email'}) */
  statusFieldMap?: Partial<Record<number, Path<T>>>;
  /** 전역 에러 출력 시 */
  setServerError?: (msg: string) => void;
  /** 메시지 오버라이드(i18n) */
  messages?: ErrorMessageMap;
};

/** RHF 폼에 AppError를 매핑 */
export function applyFormError<T extends FieldValues>(
  err: AppError,
  opts: ApplyFormErrorOptions<T>
) {
  const { setError, setFocus, statusFieldMap, setServerError, messages } = opts;

  // 1) 서버가 필드 에러 제공
  const fields = parseFieldErrors(err);
  if (fields) {
    const keys = Object.keys(fields);
    for (const k of keys) {
      setError(k as Path<T>, { type: 'server', message: fields[k]! });
    }
    if (keys[0]) setFocus?.(keys[0] as Path<T>);
    return;
  }

  // 2) 상태 코드 → 특정 필드
  if (err.kind === 'HttpError') {
    const field = statusFieldMap?.[err.status!];
    if (field) {
      setError(field, { type: 'server', message: errorToMessage(err, messages) });
      setFocus?.(field);
      return;
    }
  }

  // 3) 그 외 전역 에러
  setServerError?.(errorToMessage(err, messages));
}
