import { describe, it, expect, vi } from 'vitest';

// 🔥 hoisted mock - import들보다 "논리적으로" 먼저 실행됨
const mocks = vi.hoisted(() => ({
  usernameUniqueValidator: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../lib/validators/users', () => mocks);
import { loginSchema, signupSchema } from './schemas';

describe('loginSchema', () => {
  it('성공: 올바른 이메일/비밀번호', () => {
    const ok = loginSchema.safeParse({ email: 'a@b.com', password: '12345678' });
    expect(ok.success).toBe(true);
  });

  it('실패: 형식 불일치', () => {
    const bad = loginSchema.safeParse({ email: 'not-email', password: 'short' });
    expect(bad.success).toBe(false);
  });
});

describe('signupSchema', () => {
  it('성공: 올바른 값', async () => {
    const ok = await signupSchema.safeParseAsync({
      email: 'test@example.com',
      username: 'tester',
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(ok.success).toBe(true);

    expect(mocks.usernameUniqueValidator).toHaveBeenCalledWith('tester');
  });

  it('실패: 비밀번호 불일치', async () => {
    const bad = await signupSchema.safeParseAsync({
      email: 'test@example.com',
      username: 'tester',
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(bad.success).toBe(false);
  });

  it('실패: 너무 짧은 아이디', async () => {
    const bad = await signupSchema.safeParseAsync({
      email: 'test@example.com',
      username: 'te',
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(bad.success).toBe(false);
  });

  it('실패: 5MB 초과 파일 업로드', async () => {
    const bigFile = new File(['a'.repeat(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    const bad = await signupSchema.safeParseAsync({
      email: 'test@example.com',
      username: 'tester',
      password: '12345678',
      confirmPassword: '12345678',
      profileImage: bigFile,
    });
    expect(bad.success).toBe(false);
  });
});
