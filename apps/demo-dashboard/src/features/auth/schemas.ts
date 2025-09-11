import { z } from 'zod';
import { usernameUniqueValidator } from '../../lib/validators/users';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해 주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상입니다.'),
});
export type LoginValues = z.infer<typeof loginSchema>;

/** 브라우저 환경에서만 FileList 인스턴스 검증 + 첫 파일만 사용 + 5MB 제한 */
// ✅ 환경 독립적인 profileImage 스키마 (File | FileList | file-like 모두 대응)
// 최종 타입: File | undefined
const profileImageSchema: z.ZodType<File | undefined> = z
  .any()
  .transform((v) => {
    if (!v) return undefined;

    // FileList → 첫 파일
    if (typeof FileList !== 'undefined' && v instanceof FileList) {
      return v.length > 0 ? v[0] : undefined;
    }

    // File 그대로
    if (typeof File !== 'undefined' && v instanceof File) {
      return v as File;
    }

    // file-like 객체(테스트/SSR 환경 대비): size:number 있으면 파일처럼 취급
    if (typeof v === 'object' && v !== null && 'size' in v && typeof (v as any).size === 'number') {
      return v as unknown as File;
    }

    return undefined;
  })
  .refine((f) => !f || (f as File).size <= 5 * 1024 * 1024, '5MB 이하만 업로드 가능합니다.')
  .optional();

/** 유저네임 유니크 체크 캐시(간단 TTL) */
const usernameCache = new Map<string, { ok: boolean; ts: number }>();
const TTL = 10_000; // 10초

async function checkUsernameUniqueCached(username: string) {
  const now = Date.now();
  const cached = usernameCache.get(username);
  if (cached && now - cached.ts < TTL) return cached.ok;

  // ✅ 여기서 boolean으로 강제 변환
  let ok: boolean;
  try {
    const res = await usernameUniqueValidator(username);
    ok = res === true; // strict true만 통과. (문자열/false/undefined 전부 실패)
  } catch {
    ok = false; // 네트워크 에러 등은 실패로 본다(원하면 true로 완화 가능)
  }

  usernameCache.set(username, { ok, ts: now });
  return ok;
}

export const signupSchema = z
  .object({
    email: z.string().email('올바른 이메일을 입력해 주세요.'),
    username: z.string().min(3, '아이디는 3자 이상이어야 합니다.'),
    password: z.string().min(8, '비밀번호는 8자 이상입니다.'),
    confirmPassword: z.string().min(8, '비밀번호 확인도 입력해 주세요.'),
    profileImage: profileImageSchema,
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  })
  .superRefine(async (d, ctx) => {
    // 길이 통과한 경우에만 서버 체크
    if (d.username && d.username.length >= 3) {
      const ok = await checkUsernameUniqueCached(d.username);
      if (!ok) {
        ctx.addIssue({
          path: ['username'],
          code: z.ZodIssueCode.custom,
          message: '이미 사용 중인 아이디예요.',
        });
      }
    }
  });

export type SignupValues = z.infer<typeof signupSchema>; // profileImage: File | undefined
