'use client';
import { memo, useCallback } from 'react';
import { User } from '@/types/user';
import { UserCard } from './UserCard';
import { logRender } from '@/lib/profiler';

interface UserListProps {
  users: User[];
  onDelete: (id: number) => void;
}

function UserListBase({ users, onDelete }: UserListProps) {
  logRender('UserList', { count: users.length });

  // 📌 콜백 메모이제이션 → UserCard.memo와 시너지
  const handleSelect = useCallback((id: number) => {
    console.log('Selected:', id);
  }, []);

  return (
    <div className="grid gap-3">
      {users.map((u) => (
        <UserCard key={u.id} user={u} onSelect={handleSelect} onDelete={onDelete} />
      ))}
    </div>
  );
}

export const UserList = memo(UserListBase);
