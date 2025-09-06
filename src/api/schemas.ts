import { z } from 'zod';

// 예시: 사용자 응답 스키마
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'manager']).default('user'),
});

export type User = z.infer<typeof UserSchema>;
