'use client';
import { memo } from 'react';
import { User } from '@/types/user';
import { logRender } from '@/lib/profiler';

function heavyWork(ms: number) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // CPU 점유 (병목 시뮬레이션)
  }
}

interface UserCardProps {
  user: User;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

function UserCardBase({ user, onSelect, onDelete }: UserCardProps) {
  logRender('UserCard', user.id);
  heavyWork(5);

  return (
    <div className="rounded-md border p-4 shadow-sm flex justify-between items-center">
      <button
        type="button"
        onClick={() => onSelect(user.id)}
        className="text-left flex-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
      >
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-neutral-500">{user.email}</p>
      </button>

      <button
        type="button"
        onClick={() => onDelete(user.id)}
        className="ml-4 rounded bg-red-500 px-2 py-1 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
      >
        삭제
      </button>
    </div>
  );
}

export const UserCard = memo(UserCardBase);
