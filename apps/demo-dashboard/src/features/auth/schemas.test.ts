import { describe, it, expect } from 'vitest';
import { loginSchema } from './schemas';

describe('loginSchema', () => {
  it('성공: 올바른 이메일/비밀번호', () => {
    const ok = loginSchema.safeParse({ email: 'a@b.com', password: '12345678' });
    expect(ok.success).toBe(true);
  });

  it('실패: 형식 불일치', () => {
    const bad = loginSchema.safeParse({ email: 'not-email', password: 'short' });
    expect(bad.success).toBe(false);

    if (!bad.success) {
      const issues = bad.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      // 이메일/비밀번호 둘 다 이슈가 있어야 함
      expect(issues.some((i) => i.path.includes('email'))).toBe(true);
      expect(issues.some((i) => i.path.includes('password'))).toBe(true);
    }
  });
});
