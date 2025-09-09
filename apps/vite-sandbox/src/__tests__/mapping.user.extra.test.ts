import { describe, it, expect } from 'vitest';
import { mapUserDtoToVm } from '../mapping/user.mapping';
import type { UserDTO } from '../types/user';

describe('User mapping (extra)', () => {
  it('plan 라벨/배지 분기 확인', () => {
    const mk = (plan: UserDTO['plan']) =>
      mapUserDtoToVm({
        id: 1,
        name: 'X',
        email: 'x@ex.com',
        created_at: '2025-01-01T00:00:00Z',
        plan,
        is_active: true,
        address: null,
      });

    expect(mk('starter').planLabel).toBe('스타터');
    expect(mk('starter').badge).toBe('NEW');

    expect(mk('pro').planLabel).toBe('프로');
    expect(mk('pro').badge).toBe('PRO');

    expect(mk('enterprise').planLabel).toBe('엔터');
    expect(mk('enterprise').badge).toBe('ENT');
  });

  it('created_at 파싱 실패 시 epoch으로 대체', () => {
    const vm = mapUserDtoToVm({
      id: 2,
      name: 'Bad',
      email: 'b@ex.com',
      created_at: 'invalid-date',
      plan: 'pro',
      is_active: false,
      address: null,
    });
    expect(vm.joinedAt instanceof Date).toBe(true);
    expect(vm.joinedAt.getTime()).toBe(0); // 1970-01-01
  });
});
