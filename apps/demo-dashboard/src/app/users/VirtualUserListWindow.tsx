'use client';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { User } from '@/types/user';
import { UserCard } from './UserCard';

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

function Row({ index, style, data }: ListChildComponentProps) {
  const {
    users,
    selectedId,
    editing,
    onSelect,
    onDelete,
    onContextMenu,
    onStartEdit,
    onEditChange,
    onStopEdit,
  } = data;
  const user = users[index];
  return (
    <div style={style}>
      <UserCard
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
    </div>
  );
}

export function VirtualUserListWindow({
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
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={80}
      width="100%"
      itemData={{
        users,
        selectedId,
        editing,
        onSelect,
        onDelete,
        onContextMenu,
        onStartEdit,
        onEditChange,
        onStopEdit,
      }}
    >
      {Row}
    </FixedSizeList>
  );
}
