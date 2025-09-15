'use client';
import { memo } from 'react';
import { User } from '@/types/user';
import { logRender } from '@/lib/profiler';

function heavyWork(ms: number) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // CPU를 강제로 점유 (busy-wait)
  }
}

function UserCardBase({ user }: { user: User }) {
  logRender('UserCard', user.id);

  // 🔥 렌더링 시 5ms 지연 (병목 시뮬레이션)
  heavyWork(5);

  return (
    <div className="rounded-md border p-4 shadow-sm">
      <p className="font-semibold">{user.name}</p>
      <p className="text-sm text-neutral-500">{user.email}</p>
    </div>
  );
}

export const UserCard = memo(UserCardBase);
