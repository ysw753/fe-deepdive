/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { loginRequest } from '../api';
import { applyFormError } from 'api-safety-sdk';

// loginRequest mock
vi.mock('../api', () => ({
  loginRequest: vi.fn(),
}));

// applyFormError mock – 실제 sdk 동작과 유사하게 구현
vi.mock('api-safety-sdk', () => ({
  applyFormError: vi.fn((err, { setError, setFocus, setServerError, statusFieldMap }) => {
    // 상태 코드 매핑이 있으면 해당 필드 에러로 처리
    if (err.kind === 'HttpError' && statusFieldMap?.[err.status]) {
      setError(statusFieldMap[err.status], { type: 'server', message: err.message });
      setFocus?.(statusFieldMap[err.status]);
      return;
    }
    // 그 외는 전역 에러로 처리
    setServerError?.(err.message);
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('정상 입력 시 loginRequest가 호출된다', async () => {
    const user = userEvent.setup();
    (loginRequest as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    await user.type(screen.getByLabelText('이메일'), 'you@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(loginRequest).toHaveBeenCalledWith({
      email: 'you@example.com',
      password: 'password123',
    });
  });

  it('401 실패 시 password 필드에 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    (loginRequest as jest.Mock).mockResolvedValue({
      ok: false,
      error: { kind: 'HttpError', status: 401, message: '인증 실패' },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText('이메일'), 'you@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'wrongpass');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    const pwdInput = screen.getByLabelText(/^비밀번호$/);
    expect(pwdInput).toHaveAttribute('aria-invalid', 'true');

    const err = await screen.findByRole('alert');
    expect(err).toHaveTextContent('인증 실패');
    expect(applyFormError).toHaveBeenCalled();
  });

  it('첫 실패 후 성공하면 에러 메시지가 사라진다', async () => {
    const user = userEvent.setup();

    (loginRequest as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        error: { kind: 'HttpError', status: 401, message: '인증 실패' },
      })
      .mockResolvedValueOnce({ ok: true });

    render(<LoginForm />);

    await user.type(screen.getByLabelText('이메일'), 'you@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'wrongpass');

    // 첫 제출 → 실패
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('인증 실패');

    // 버튼 다시 활성화될 때까지 대기
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled();
    });

    // 두 번째 제출 → 성공
    await user.click(screen.getByRole('button', { name: '로그인' }));

    // 에러 메시지 사라지는 것 확인
    // 먼저 alert가 있는지 확인
    const alertEl = screen.queryByRole('alert');
    if (alertEl) {
      await waitForElementToBeRemoved(alertEl);
    }
  });

  it('네트워크 예외 발생 시 전역 "서버 오류" alert가 표시된다', async () => {
    const user = userEvent.setup();
    (loginRequest as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText('이메일'), 'you@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('서버 오류');
  });
});
