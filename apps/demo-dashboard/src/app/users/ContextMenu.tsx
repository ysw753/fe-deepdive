'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '@/types/user';

interface ContextMenuProps {
  x: number;
  y: number;
  user: User;
  onClose: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: number) => void;
}

export function ContextMenu({ x, y, user, onClose, onEdit, onDelete }: ContextMenuProps) {
  // ESC 키 or 바깥 클릭 → 메뉴 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = (e: MouseEvent) => {
      onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return createPortal(
    <ul
      className="absolute z-50 w-40 rounded-md border bg-white shadow-lg text-sm overflow-hidden"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <li>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-md"
          onClick={() => {
            onEdit?.(user);
            onClose();
          }}
        >
          ✏️ 편집하기
        </button>
      </li>
      <li>
        <button
          className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 rounded-b-md"
          onClick={() => {
            onDelete?.(user.id);
            onClose();
          }}
        >
          🗑️ 삭제하기
        </button>
      </li>
    </ul>,
    document.body
  );
}
