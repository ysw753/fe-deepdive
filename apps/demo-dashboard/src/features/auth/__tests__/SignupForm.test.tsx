/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '../SignupForm';

import { applyFormError } from 'api-safety-sdk';
import { signupRequest } from '../../../lib/api/users';

// API mock
vi.mock('../../../lib/api/users', () => ({
  signupRequest: vi.fn(),
}));

// SDK mock – 실제 동작처럼
vi.mock('api-safety-sdk', () => ({
  applyFormError: vi.fn((err, { setError, setFocus, setServerError, statusFieldMap }) => {
    if (err.kind === 'HttpError' && statusFieldMap?.[err.status]) {
      setError(statusFieldMap[err.status], { type: 'server', message: err.message });
      setFocus?.(statusFieldMap[err.status]);
      return;
    }
    setServerError?.(err.message);
  }),
}));

// usernameUniqueValidator 무조건 성공하도록 mock (superRefine 방해 제거)
vi.mock('../../../lib/validators/users', () => ({
  usernameUniqueValidator: vi.fn().mockResolvedValue(true),
}));

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function fillForm(
    user: ReturnType<typeof userEvent.setup>,
    overrides: Partial<Record<string, any>> = {}
  ) {
    await user.type(
      screen.getByLabelText(/아이디/, { exact: false }),
      overrides.username ?? 'newuser'
    );
    await user.type(
      screen.getByLabelText(/이메일/, { exact: false }),
      overrides.email ?? 'new@example.com'
    );
    await user.type(
      screen.getByLabelText(/^비밀번호(?! 확인)/, { exact: false }),
      overrides.password ?? 'password123'
    );
    await user.type(
      screen.getByLabelText(/비밀번호 확인/, { exact: false }),
      overrides.confirmPassword ?? 'password123'
    );

    if (overrides.file !== false) {
      const file = overrides.file ?? new File(['dummy'], 'avatar.png', { type: 'image/png' });
      await user.upload(screen.getByLabelText(/프로필 이미지/), file);
      return file;
    }
    return undefined;
  }

  it('모든 필드를 입력하면 signupRequest가 호출된다', async () => {
    const user = userEvent.setup();
    (signupRequest as vi.Mock).mockResolvedValue({ ok: true });

    render(<SignupForm />);
    const file = await fillForm(user);

    await user.click(screen.getByRole('button', { name: '회원가입' }));

    expect(signupRequest).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      profileImage: file,
    });
  });

  it('409 충돌 시 username 필드에 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    (signupRequest as vi.Mock).mockResolvedValue({
      ok: false,
      error: { kind: 'HttpError', status: 409, message: '이미 존재하는 아이디예요.' },
    });

    render(<SignupForm />);
    await fillForm(user);

    await user.click(screen.getByRole('button', { name: '회원가입' }));

    // username input에 aria-invalid=true 설정 확인
    const usernameInput = screen.getByLabelText(/아이디/, { exact: false });
    expect(usernameInput).toHaveAttribute('aria-invalid', 'true');

    // 에러 메시지가 필드 밑에 표시됨
    const err = await screen.findByRole('alert');
    expect(err).toHaveTextContent('이미 존재하는 아이디예요.');
    expect(applyFormError).toHaveBeenCalled();
  });

  it('예외 발생 시 전역 "서버 오류" alert가 표시된다', async () => {
    const user = userEvent.setup();
    (signupRequest as vi.Mock).mockRejectedValue(new Error('서버 오류'));

    render(<SignupForm />);
    await fillForm(user);

    await user.click(screen.getByRole('button', { name: '회원가입' }));

    // 전역 서버 오류 메시지 확인 (state 반영 기다림)
    await waitFor(async () => {
      expect(await screen.findByRole('alert')).toHaveTextContent('서버 오류');
    });
  });

  it('제출 중일 때 버튼이 비활성화되고 "회원가입 중..."으로 표시된다', async () => {
    const user = userEvent.setup();
    let resolveFn: (value: any) => void;
    (signupRequest as vi.Mock).mockImplementation(
      () => new Promise((resolve) => (resolveFn = resolve))
    );

    render(<SignupForm />);
    await fillForm(user);

    await user.click(screen.getByRole('button', { name: '회원가입' }));

    // 비동기 상태 동안 버튼 disabled
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent('회원가입 중...');
    });

    // 요청 resolve
    resolveFn!({ ok: true });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeEnabled();
      expect(screen.getByRole('button')).toHaveTextContent('회원가입');
    });
  });
});
