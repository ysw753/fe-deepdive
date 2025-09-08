import type { UserDTO } from '@/types/user';
import { mapUserDtoToVm } from '@/mapping/user.mapping';
// (옵션) import { mapArray } from "@/mapping/createMapper";

export function UserList({ users }: { users: UserDTO[] }) {
  // const vms = mapArray(mapUserDtoToVm)(users);
  const vms = users.map(mapUserDtoToVm);

  return (
    <ul>
      {vms.map((u) => (
        <li key={u.id} style={{ marginBottom: 8 }}>
          <strong>{u.displayName}</strong> — {u.planLabel} ({u.badge}) /{' '}
          {u.active ? '활성' : '비활성'} / {u.joinedAt.toLocaleDateString()}
          {u.city ? ` — ${u.city}` : ''}
        </li>
      ))}
    </ul>
  );
}
