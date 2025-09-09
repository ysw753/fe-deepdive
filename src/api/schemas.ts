import { z } from 'zod';

export const AddressSchema = z.object({
  line1: z.string().min(1, '주소 1은 필수야.'),
  line2: z.string().optional(),
  city: z.string().min(1, '도시는 필수야.'),
  postalCode: z.string().regex(/^\d{5}$/, '우편번호는 5자리 숫자여야 해.'),
});

export const UserSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'manager']).default('user'),
    createdAt: z.coerce.date(), // ISO 문자열도 Date로 강제 변환
    address: AddressSchema,
  })
  .superRefine((val, ctx) => {
    // 예시: 관리자 메일 도메인 제한
    if (val.role === 'admin' && !val.email.endsWith('@company.com')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '관리자 계정은 @company.com 메일만 허용해.',
        path: ['email'],
      });
    }
  });

export type User = z.infer<typeof UserSchema>;

// 페이지네이션 응답 제네릭 팩토리
export const pageSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  });

export const UserPageSchema = pageSchema(UserSchema);
export type UserPage = z.infer<typeof UserPageSchema>;
