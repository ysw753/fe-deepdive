'use client';
import { useRef, useState } from 'react';
import { useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from './schemas';
import { loginRequest } from './api';
import { FormField } from '../../components/FormField';
import { applyFormError } from 'api-safety-sdk';

const STATUS_FIELD_MAP = {
  400: 'password',
  401: 'password',
} satisfies Partial<Record<number, Path<LoginValues>>>;

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const submitSeqRef = useRef(0);

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onSubmit' });

  const onInvalid = (fieldErrors: typeof errors) => {
    const first = Object.keys(fieldErrors)[0] as keyof LoginValues | undefined;
    if (first) setFocus(first);
  };

  const onValid = async (values: LoginValues) => {
    setServerError(null);

    const mySeq = ++submitSeqRef.current;

    try {
      const res = await loginRequest(values);

      if (mySeq !== submitSeqRef.current) return;

      if (res.ok) {
        setServerError(null);
        return;
      }

      applyFormError(res.error, {
        setError,
        setFocus,
        setServerError,
        statusFieldMap: STATUS_FIELD_MAP,
      });
    } catch {
      if (mySeq !== submitSeqRef.current) return;
      setServerError('서버 오류');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onValid, onInvalid)}
      noValidate
      aria-busy={isSubmitting}
      className="mx-auto max-w-md rounded-xl border border-neutral-200 p-6 dark:border-neutral-800"
    >
      <FormField
        label="이메일"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <FormField
        label="비밀번호"
        type="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        {...register('password')}
        error={errors.password?.message}
        hint="8자 이상"
      />

      {serverError && (
        <div id="form-error" role="alert" aria-live="polite" className="mb-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
        className="w-full rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-200 dark:bg-neutral-200 dark:text-neutral-900"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
