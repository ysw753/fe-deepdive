import type { UserDTO } from '@/types/user';
import { mapUserDtoToVm } from '@/mapping/user.mapping';

export function UserDetail({ user }: { user: UserDTO }) {
  const vm = mapUserDtoToVm(user);

  return (
    <section>
      <h2>{vm.displayName}</h2>
      <p>ID: {vm.id}</p>
      <p>Email: {vm.email}</p>
      <p>Joined: {vm.joinedAt.toLocaleDateString()}</p>
      <p>
        Plan: {vm.planLabel} <small>({vm.badge})</small>
      </p>
      <p>Active: {vm.active ? 'Y' : 'N'}</p>
      {vm.city && <p>City: {vm.city}</p>}
    </section>
  );
}
