import { z } from 'zod';
import { fetchJson } from 'api-safety-sdk';

const API_BASE = 'https://reqres.in/api';
const LoginResponse = z.object({ token: z.string() });
type LoginRes = z.infer<typeof LoginResponse>;

export async function loginRequest(values: { email: string; password: string }) {
  return fetchJson<LoginRes>(`${API_BASE}/login`, {
    method: 'POST',
    // SDK에 jsonBody 옵션이 있으니 이 방식이 깔끔함
    jsonBody: true,
    body: values,
    timeoutMs: 5000,
    schema: LoginResponse,
    // 필요시: credentials: "include",
  });
}
