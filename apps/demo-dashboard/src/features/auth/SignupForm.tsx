'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from './schemas';
import { FormField } from '../../components/FormField';
import { applyFormError } from 'api-safety-sdk';
import { signupRequest } from '../../lib/api/users';
import type { z } from 'zod';
// 🔑 스키마에서 input/output 타입을 분리해서 선언
type SignupInput = z.input<typeof signupSchema>; // 변환 전 (profileImage: unknown 등)
type SignupOutput = z.output<typeof signupSchema>; // 변환 후 (profileImage: File | undefined)

export default function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange', // ✅ 입력 시 즉시 에러 해제
    reValidateMode: 'onBlur', // ✅ 비동기 검증은 blur에서만
  });

  // 실제 전송은 "출력 타입"으로 안전하게 파싱해서 사용
  const onSubmit = handleSubmit(async (raw) => {
    // ✅ 변환 및 검증을 다시 한 번 보장(타입도 출력 타입으로 확정)
    const values: SignupOutput = await signupSchema.parseAsync(raw);

    setServerError(null);
    try {
      const res = await signupRequest(values);

      if (!res.ok) {
        applyFormError(res.error, {
          setError,
          setFocus,
          setServerError,
          statusFieldMap: { 409: 'username' },
        });
        return;
      }
      alert('회원가입 성공!');
    } catch (e) {
      setServerError('서버 오류'); // 👈 여기
    }
  });
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      encType="multipart/form-data" // ✅ 파일 업로드
      aria-busy={isSubmitting} // ✅ 제출 중 상태
      aria-describedby={serverError ? 'form-error' : undefined} // ✅ 서버 오류 연결
      className="mx-auto max-w-md rounded-xl border border-neutral-200 p-6 dark:border-neutral-800"
    >
      {/* 아이디 필드 + 비동기 중복검증 */}
      <FormField
        label="아이디"
        autoComplete="username"
        required
        {...register('username')}
        error={errors.username?.message}
      />
      <FormField
        label="이메일"
        type="email"
        autoComplete="email"
        required
        {...register('email')}
        error={errors.email?.message}
      />

      <FormField
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        required
        {...register('password')}
        error={errors.password?.message}
        hint="8자 이상"
      />

      <FormField
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        required
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      {/* 파일 업로드 */}
      <FormField
        label="프로필 이미지"
        type="file"
        accept="image/*"
        {...register('profileImage')}
        error={errors.profileImage?.message as string}
      />

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
        className="w-full rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-200 dark:bg-neutral-200 dark:text-neutral-900"
      >
        {isSubmitting ? '회원가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
