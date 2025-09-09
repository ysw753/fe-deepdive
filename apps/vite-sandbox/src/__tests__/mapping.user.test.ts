import { describe, it, expect } from 'vitest';
import { mapUserDtoToVm } from '../mapping/user.mapping';
import type { UserDTO } from '../types/user';

describe('User mapping', () => {
  it('DTO→VM 기본 매핑', () => {
    const dto: UserDTO = {
      id: 1,
      name: 'Ada',
      email: 'ada@ex.com',
      created_at: '2024-01-02T03:04:05.000Z',
      plan: 'pro',
      is_active: true,
      address: { city: 'Seoul' },
    };
    const vm = mapUserDtoToVm(dto);
    expect(vm.id).toBe('1');
    expect(vm.displayName).toBe('Ada');
    expect(vm.planLabel).toBe('프로');
    expect(vm.joinedAt instanceof Date).toBe(true);
    expect(vm.city).toBe('Seoul');
  });

  it('주소 없음(옵셔널) 처리', () => {
    const vm = mapUserDtoToVm({
      id: 2,
      name: 'Turing',
      email: 't@ex.com',
      created_at: '2024-01-02T03:04:05Z',
      plan: 'starter',
      is_active: false,
      address: null,
    });
    expect(vm.city).toBeUndefined();
    expect(vm.badge).toBe('NEW');
  });
});
