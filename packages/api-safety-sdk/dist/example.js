import { fetchJson } from './fetchJson';
import { UserSchema } from './schemas';
// GET 예시
export async function getUser(userId) {
    return fetchJson(`/api/users/${userId}`, {
        method: 'GET',
        schema: UserSchema,
        timeoutMs: 8000,
    });
}
// POST 예시
export async function createUser(input) {
    return fetchJson('/api/users', {
        method: 'POST',
        body: input,
        jsonBody: true,
        schema: UserSchema,
        timeoutMs: 10000,
    });
}
