'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { User } from '@/types/user';
import { UserList } from './UserList';
import { FormField } from '@/components/FormField'; // 🔹 Day6에서 만든 컴포넌트 import

interface UsersClientProps {
  initialUsers: User[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

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

      {/* 유저 목록 */}
      <UserList users={filteredUsers} onDelete={handleDelete} />
    </div>
  );
}
