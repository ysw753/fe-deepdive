'use client';
import { memo, KeyboardEvent } from 'react';
import { User } from '@/types/user';
import { logRender } from '@/lib/profiler';

interface UserCardProps {
  user: User;
  isSelected: boolean;
  isEditing: boolean;
  editValue?: string;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onContextMenu: (e: React.MouseEvent, user: User) => void;
  onStartEdit: (id: number, value: string) => void;
  onEditChange: (id: number, value: string) => void;
  onStopEdit: (save?: boolean) => void;
}

function UserCardBase({
  user,
  isSelected,
  isEditing,
  editValue,
  onSelect,
  onDelete,
  onContextMenu,
  onStartEdit,
  onEditChange,
  onStopEdit,
}: UserCardProps) {
  logRender('UserCard', user.id);
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onStopEdit(true); // 저장
    } else if (e.key === 'Escape') {
      onStopEdit(false); // 취소
    }
  };
  return (
    <div
      className={`rounded-md border p-4 shadow-sm flex justify-between items-center ${
        isSelected ? 'bg-blue-50 border-blue-400' : ''
      }`}
      onContextMenu={(e) => onContextMenu(e, user)}
    >
      {/* 왼쪽: 유저 정보 */}
      <div
        className="text-left flex-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
        onClick={() => onSelect(user.id)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue ?? ''}
            onChange={(e) => onEditChange(user.id, e.target.value)}
            onBlur={() => onStopEdit(true)}
            onKeyDown={handleKeyDown}
            className="w-full border rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </>
        )}
      </div>

      {/* 오른쪽: 버튼 */}
      {!isEditing && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onStartEdit(user.id, user.name)}
            className="rounded bg-yellow-500 px-2 py-1 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500"
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            className="rounded bg-red-500 px-2 py-1 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

export const UserCard = memo(UserCardBase);
