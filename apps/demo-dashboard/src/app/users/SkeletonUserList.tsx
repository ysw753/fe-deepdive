'use client';

export function SkeletonUserList() {
  // 가짜 유저 10명짜리 스켈레톤
  return (
    <ul className="divide-y divide-gray-200 border rounded animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 p-3">
          <div className="h-10 w-10 rounded-full bg-gray-300" />
          <div className="flex-1">
            <div className="h-4 w-1/3 bg-gray-300 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
