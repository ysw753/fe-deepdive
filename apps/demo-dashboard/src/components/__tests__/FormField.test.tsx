/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from '../FormField';
import React from 'react';

describe('FormField', () => {
  it('label↔input 연결, hint가 aria-describedby에 포함된다', () => {
    render(<FormField label="이메일" name="email" hint="회사 메일" />);
    const input = screen.getByLabelText('이메일') as HTMLInputElement;
    const hint = screen.getByText('회사 메일');
    expect(input).toBeInTheDocument();
    expect(hint).toBeInTheDocument();
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('error가 있을 땐 aria-invalid/errormessage가 설정되고 hint는 제외된다', () => {
    render(<FormField label="이메일" name="email" hint="회사 메일" error="필수 입력입니다" />);
    const input = screen.getByLabelText('이메일') as HTMLInputElement;

    // alert는 보통 접근성 이름이 없어 name 옵션 없이 잡는다
    const err = screen.getByRole('alert');
    expect(err).toHaveTextContent('필수 입력입니다');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-errormessage', err.id);
    // error가 있으면 hint가 aria-describedby에서 제외됨
    expect(input.getAttribute('aria-describedby')).toBe(err.id);
  });

  it('Tab으로 포커스 가능', async () => {
    const user = userEvent.setup();
    render(<FormField label="아이디" name="username" />);
    await user.tab();
    expect(screen.getByLabelText('아이디')).toHaveFocus();
  });
});
