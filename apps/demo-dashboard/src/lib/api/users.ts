import { SignupValues } from '@/features/auth/schemas';
import { User } from '@/types/user';
import { fetchJson, type ApiResult } from 'api-safety-sdk';

// 아이디 중복 체크
export async function checkUsernameExists(
  username: string
): Promise<ApiResult<{ exists: boolean }>> {
  return fetchJson<{ exists: boolean }>(`/users/exists?username=${encodeURIComponent(username)}`);
}

// 회원가입 요청
export async function signupRequest(values: SignupValues): Promise<ApiResult<{ userId: string }>> {
  const formData = new FormData();

  formData.append('email', values.email);
  formData.append('username', values.username);
  formData.append('password', values.password);

  if (values.profileImage) {
    formData.append('profileImage', values.profileImage);
  }

  return fetchJson<{ userId: string }>('/users/signup', {
    method: 'POST',
    body: formData,
    jsonBody: false, // FormData라 자동 stringify 방지
  });
}
// 🔹 유저 목록 조회 (더미 데이터 500명)
export async function getUsers(): Promise<User[]> {
  const users: User[] = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));

  return Promise.resolve(users);
}
