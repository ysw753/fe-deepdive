import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { AppError } from '../errors';
import { type ErrorMessageMap } from '../error-helpers';
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
export declare function applyFormError<T extends FieldValues>(err: AppError, opts: ApplyFormErrorOptions<T>): void;
