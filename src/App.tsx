import { UserDetail } from './components/UserDetail';
import { UserList } from './components/UserList';
import type { UserDTO } from './types/user';

const list: UserDTO[] = [
  {
    id: 1,
    name: 'Ada',
    email: 'ada@ex.com',
    created_at: '2025-01-02T03:04:05.000Z',
    plan: 'pro',
    is_active: true,
    address: { city: 'Seoul' },
  },
  {
    id: 2,
    name: 'Turing',
    email: 't@ex.com',
    created_at: 'not-a-date',
    plan: 'starter',
    is_active: false,
    address: null,
  },
  {
    id: 3,
    name: 'Grace',
    email: 'g@ex.com',
    created_at: '2025-07-01T10:00:00Z',
    plan: 'enterprise',
    is_active: true,
    address: { city: 'Busan' },
  },
];

export default function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>유저 목록</h1>
      <UserList users={list} />
      <hr />
      <h2>유저 상세</h2>
      <UserDetail user={list[0]} />
    </main>
  );
}
