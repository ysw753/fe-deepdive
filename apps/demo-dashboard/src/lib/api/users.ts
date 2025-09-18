import { SignupValues } from '@/features/auth/schemas';
import { User } from '@/types/user';
import { QueryClient } from '@tanstack/react-query';
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
export async function heavyWork(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🔹 유저 목록 조회 (더미 데이터 + 딜레이 + 랜덤 에러)
// export async function getUsers(): Promise<User[]> {
//   // 일부러 2초 지연 → Skeleton 확인용
//   await heavyWork(2000);

//   // 30% 확률로 에러 발생
//   if (Math.random() < 0.01) {
//     throw new Error('🚨 랜덤 에러 발생! 데이터를 불러오지 못했습니다.');
//   }

//   const users: User[] = Array.from({ length: 500 }, (_, i) => ({
//     id: i + 1,
//     name: `User ${i + 1}`,
//     email: `user${i + 1}@example.com`,
//   }));

//   return users;
// }
export async function getUsers(): Promise<User[]> {
  // 30% 확률로 에러 발생
  if (Math.random() < 0.3) {
    throw new Error('🚨 랜덤 에러 발생! 데이터를 불러오지 못했습니다.');
  }

  // 진짜 API 요청
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!res.ok) throw new Error('데이터 불러오기 실패!');
  const data = await res.json();

  // 타입 맞춰 변환
  return data.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));
}
// 유저 추가
export async function addUser(newUser: Omit<User, 'id'>): Promise<User> {
  // 실제 API에서는 POST /users
  // 지금은 더미로 setTimeout
  await new Promise((r) => setTimeout(r, 1000));

  return {
    id: Math.floor(Math.random() * 10000),
    ...newUser,
  };
}

// 유저 삭제
export async function deleteUser(userId: number): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 1000));

  return { success: true };
}

export async function prefetchUsers(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}
