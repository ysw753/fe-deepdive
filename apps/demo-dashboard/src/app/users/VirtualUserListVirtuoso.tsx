'use client';

import { User } from '@/types/user';
import { UserCard } from './UserCard';
import { Virtuoso } from 'react-virtuoso';

interface VirtualUserListProps {
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

export function VirtualUserListVirtuoso({
  users,
  selectedId,
  editing,
  onSelect,
  onDelete,
  onContextMenu,
  onStartEdit,
  onEditChange,
  onStopEdit,
}: VirtualUserListProps) {
  return (
    <Virtuoso
      style={{ height: 600 }}
      totalCount={users.length}
      itemContent={(index) => {
        const user = users[index];
        return (
          <UserCard
            key={user.id}
            user={user}
            isSelected={user.id === selectedId}
            isEditing={editing?.id === user.id}
            editValue={editing?.id === user.id ? editing.value : undefined}
            onSelect={onSelect}
            onDelete={onDelete}
            onContextMenu={onContextMenu}
            onStartEdit={onStartEdit}
            onEditChange={onEditChange}
            onStopEdit={onStopEdit}
          />
        );
      }}
    />
  );
}
