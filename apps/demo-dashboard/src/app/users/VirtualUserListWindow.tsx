'use client';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { User } from '@/types/user';
import { UserCard } from './UserCard';

interface VirtualUserListProps {
  users: User[];
  onDelete: (id: number) => void;
}

function Row({ index, style, data }: ListChildComponentProps) {
  const { users, onDelete } = data;
  const user = users[index];
  return (
    <div style={style}>
      <UserCard user={user} onSelect={() => {}} onDelete={onDelete} />
    </div>
  );
}

export function VirtualUserListWindow({ users, onDelete }: VirtualUserListProps) {
  return (
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={80}
      width="100%"
      itemData={{ users, onDelete }}
    >
      {Row}
    </FixedSizeList>
  );
}
