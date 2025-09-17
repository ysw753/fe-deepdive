'use client';
import { memo } from 'react';
import { User } from '@/types/user';
import { UserCard } from './UserCard';
import { logRender } from '@/lib/profiler';

interface UserListProps {
  users: User[];
  selectedId: number | null;
  editing: { id: number; value: string } | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onContextMenu: (e: React.MouseEvent, user: User) => void;
  onStartEdit: (id: number, value: string) => void;
  onEditChange: (id: number, value: string) => void;
  onStopEdit: () => void;
}

function UserListBase({
  users,
  selectedId,
  editing,
  onSelect,
  onDelete,
  onContextMenu,
  onStartEdit,
  onEditChange,
  onStopEdit,
}: UserListProps) {
  logRender('UserList', { count: users.length });

  return (
    <div style={{ height: 600, overflowY: 'auto' }}>
      <div className="grid gap-3">
        {users.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isSelected={u.id === selectedId}
            isEditing={editing?.id === u.id}
            editValue={editing?.id === u.id ? editing.value : undefined}
            onSelect={onSelect}
            onDelete={onDelete}
            onContextMenu={onContextMenu}
            onStartEdit={onStartEdit}
            onEditChange={onEditChange}
            onStopEdit={onStopEdit}
          />
        ))}
      </div>
    </div>
  );
}

export const UserList = memo(UserListBase);
