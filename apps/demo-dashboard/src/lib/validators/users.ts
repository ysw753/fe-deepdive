import { checkUsernameExists } from '../api/users';

// ✅ RHF가 기다릴 수 있는 순수 async 함수만 export
export async function usernameUniqueValidator(username: string) {
  console.log('[usernameUniqueValidator] called:', username);

  // 빈 값은 RHF의 required/zod에게 맡기거나, 통과시켜 blur 때 소음 줄임
  if (!username) return '아이디를 입력해주세요';

  // 길이 미달일 땐 서버 호출 안 함 (zod가 이미 에러 표시)
  if (username.length < 3) return true;

  const res = await checkUsernameExists(username);
  if (!res.ok) return '중복 확인 중 오류가 발생했어요';
  return res.data.exists ? '이미 사용 중인 아이디입니다' : true;
}
