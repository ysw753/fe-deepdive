import { UserDTO, UserVM } from '../types/user';
import { createMapper } from './createMapper';

export const userMap = {
  id: 'id',
  displayName: 'name',
  email: 'email',
  active: 'is_active',
} as const satisfies Partial<Record<keyof UserVM, keyof UserDTO>>;

const parseDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date(0) : d; // 실패 시 epoch(1970-01-01)
};

export const derive = {
  id: (s) => String(s.id),
  joinedAt: (s) => parseDate(s.created_at),
  planLabel: (s) => ({ starter: '스타터', pro: '프로', enterprise: '엔터' })[s.plan],
  badge: (s) => (s.plan === 'starter' ? 'NEW' : s.plan === 'pro' ? 'PRO' : 'ENT'),
  city: (s) => s.address?.city,
} satisfies Partial<{ [K in keyof UserVM]: (s: UserDTO) => UserVM[K] }>;

export const mapUserDtoToVm = createMapper<UserDTO, UserVM>(userMap, derive);

// 역방향 예시 (편집폼 → 서버 패치)
export type UserPatchDTO = Partial<Pick<UserDTO, 'name' | 'email' | 'is_active' | 'address'>>;
export function mapVmToPatch(dto: UserVM): UserPatchDTO {
  return {
    name: dto.displayName,
    email: dto.email,
    is_active: dto.active,
    address: dto.city ? { city: dto.city } : undefined,
  };
}
