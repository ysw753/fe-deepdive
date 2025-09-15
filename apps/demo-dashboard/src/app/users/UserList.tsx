'use client';
import { User } from '@/types/user';
import { UserCard } from './UserCard';
import { logRender } from '@/lib/profiler';

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  logRender('UserList', { count: users.length });

  return (
    <div className="grid gap-3">
      {users.map((u) => (
        <UserCard key={u.id} user={u} />
      ))}
    </div>
  );
}
