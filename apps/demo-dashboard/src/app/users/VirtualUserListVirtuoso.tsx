'use client';

import { User } from '@/types/user';
import { UserCard } from './UserCard';
import { Virtuoso } from 'react-virtuoso';

interface VirtualUserListProps {
  users: User[];
  onDelete: (id: number) => void;
}

export function VirtualUserListVirtuoso({ users, onDelete }: VirtualUserListProps) {
  return (
    <Virtuoso
      style={{ height: 600 }}
      totalCount={users.length}
      itemContent={(index) => {
        const user = users[index];
        return <UserCard key={user.id} user={user} onSelect={() => {}} onDelete={onDelete} />;
      }}
    />
  );
}
