import { fetchJson } from './fetchJson';
import { UserSchema, User } from './schemas';
import { Result } from './result';
import { AppError } from './errors';

// GET 예시
export async function getUser(userId: number): Promise<Result<User, AppError>> {
  return fetchJson<User>(`/api/users/${userId}`, {
    method: 'GET',
    schema: UserSchema,
    timeoutMs: 8000,
  });
}

// POST 예시
export async function createUser(
  input: Pick<User, 'name' | 'email'>
): Promise<Result<User, AppError>> {
  return fetchJson<User>('/api/users', {
    method: 'POST',
    body: input,
    jsonBody: true,
    schema: UserSchema,
    timeoutMs: 10_000,
  });
}
