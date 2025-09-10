// apps/demo-dashboard/src/features/auth/schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해 주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상입니다.'),
});

export type LoginValues = z.infer<typeof loginSchema>;
