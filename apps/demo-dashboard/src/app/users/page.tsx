import { getUsers } from '@/lib/api/users';
import { UsersClient } from './UsersClient';

export default async function UsersPage() {
  const initialUsers = await getUsers();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Users</h1>
      <UsersClient initialUsers={initialUsers} />
    </main>
  );
}
