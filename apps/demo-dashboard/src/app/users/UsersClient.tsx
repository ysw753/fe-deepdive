'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { User } from '@/types/user';
import { UserList } from './UserList';
import { FormField } from '@/components/FormField';
import { VirtualUserListWindow } from './VirtualUserListWindow';
import { VirtualUserListVirtuoso } from './VirtualUserListVirtuoso';
import { ContextMenu } from './ContextMenu';

interface UsersClientProps {
  initialUsers: User[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [mode, setMode] = useState<'default' | 'window' | 'virtuoso'>('window');

  // 선택 상태
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    user: User;
  } | null>(null);

  // 편집 상태
  const [editing, setEditing] = useState<{ id: number; value: string } | null>(null);

  // 디바운스 적용
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => u.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [users, debouncedQuery]);

  // ➕ 유저 추가
  const handleAdd = useCallback(() => {
    if (!name || !email) return;
    setUsers((prev) => [...prev, { id: Date.now(), name, email }]);
    setName('');
    setEmail('');
  }, [name, email]);

  // ❌ 유저 삭제
  const handleDelete = useCallback((id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setContextMenu(null); // 삭제 후 메뉴 닫기
  }, []);

  // 행 선택
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  // 컨텍스트 메뉴 (위치 보정)
  const handleContextMenu = useCallback((e: React.MouseEvent, user: User) => {
    e.preventDefault();
    const menuWidth = 160;
    const menuHeight = 120;

    const x = Math.min(e.clientX, window.innerWidth - menuWidth);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight);

    setSelectedId(user.id);
    setContextMenu({ x, y, user });
  }, []);

  // 편집 시작
  const handleStartEdit = useCallback((id: number, value: string) => {
    setEditing({ id, value });
    setContextMenu(null); // 편집 시작하면 메뉴 닫기
  }, []);

  // 편집 값 변경
  const handleEditChange = useCallback((id: number, value: string) => {
    setEditing({ id, value });
  }, []);

  // 편집 종료
  const handleStopEdit = useCallback(
    (save?: boolean) => {
      if (editing) {
        if (save) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editing.id ? { ...u, name: editing.value } : u))
          );
        }
        setEditing(null);
      }
    },
    [editing]
  );

  // 🔹 스크롤/외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleScroll = () => setContextMenu(null);
    const handleClick = () => setContextMenu(null);

    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <FormField
        label="사용자 검색"
        placeholder="이름을 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        hint="이름 일부만 입력해도 검색돼요"
      />

      {/* 추가 폼 */}
      <div className="flex gap-2">
        <FormField
          label="이름"
          placeholder="예: 홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormField
          label="이메일"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          onClick={handleAdd}
          className="self-end rounded bg-blue-500 px-3 py-2 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        >
          추가
        </button>
      </div>

      {/* 모드 선택 */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('default')}
          className={`px-3 py-1 rounded ${
            mode === 'default' ? 'bg-gray-800 text-white' : 'bg-gray-200'
          }`}
        >
          Default
        </button>
        <button
          onClick={() => setMode('window')}
          className={`px-3 py-1 rounded ${
            mode === 'window' ? 'bg-gray-800 text-white' : 'bg-gray-200'
          }`}
        >
          react-window
        </button>
        <button
          onClick={() => setMode('virtuoso')}
          className={`px-3 py-1 rounded ${
            mode === 'virtuoso' ? 'bg-gray-800 text-white' : 'bg-gray-200'
          }`}
        >
          react-virtuoso
        </button>
      </div>

      {/* 유저 리스트 */}
      {mode === 'default' && (
        <UserList
          users={filteredUsers}
          selectedId={selectedId}
          editing={editing}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onContextMenu={handleContextMenu}
          onStartEdit={handleStartEdit}
          onEditChange={handleEditChange}
          onStopEdit={handleStopEdit}
        />
      )}
      {mode === 'window' && (
        <VirtualUserListWindow
          users={filteredUsers}
          selectedId={selectedId}
          editing={editing}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onContextMenu={handleContextMenu}
          onStartEdit={handleStartEdit}
          onEditChange={handleEditChange}
          onStopEdit={handleStopEdit}
        />
      )}
      {mode === 'virtuoso' && (
        <VirtualUserListVirtuoso
          users={filteredUsers}
          selectedId={selectedId}
          editing={editing}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onContextMenu={handleContextMenu}
          onStartEdit={handleStartEdit}
          onEditChange={handleEditChange}
          onStopEdit={handleStopEdit}
        />
      )}

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          user={contextMenu.user}
          onClose={() => setContextMenu(null)}
          onEdit={(user) => handleStartEdit(user.id, user.name)}
          onDelete={(id) => handleDelete(id)}
        />
      )}
    </div>
  );
}
