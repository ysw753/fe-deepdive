import { UserList } from './UserList';
import { getUsers } from '@/lib/api/users';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Users</h1>
      <UserList users={users} />
    </main>
  );
}
