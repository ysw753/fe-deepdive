'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupValues } from './schemas';
import { FormField } from '../../components/FormField';
import { applyFormError } from 'api-safety-sdk';
import { signupRequest } from '@/lib/api/users';
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

  const onValid = async (values: SignupValues) => {
    setServerError(null);

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
  };
  // 실제 전송은 "출력 타입"으로 안전하게 파싱해서 사용
  const onSubmit = handleSubmit(async (raw) => {
    // ✅ 변환 및 검증을 다시 한 번 보장(타입도 출력 타입으로 확정)
    const values: SignupOutput = await signupSchema.parseAsync(raw);

    setServerError(null);
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
  });
  return (
    <form onSubmit={onSubmit} noValidate>
      {/* 아이디 필드 + 비동기 중복검증 */}
      <FormField label="아이디" {...register('username')} error={errors.username?.message} />
      <FormField label="이메일" type="email" {...register('email')} error={errors.email?.message} />

      <FormField
        label="비밀번호"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        hint="8자 이상"
      />

      <FormField
        label="비밀번호 확인"
        type="password"
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

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '회원가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
