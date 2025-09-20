import getQueryClient from '@/lib/getQueryClient';
import { ErrorFallback } from './ErrorFallback';
import { SkeletonUserList } from './SkeletonUserList';
import { UsersClient } from './UsersClient';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { prefetchUsers } from '@/lib/api/users';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { PerfMonitor } from '@/components/PerfMonitor';
export default async function UsersPage() {
  const queryClient = getQueryClient();
  // 🔹 서버에서 미리 유저 데이터 prefetch
  await prefetchUsers(queryClient);

  const dehydratedState = dehydrate(queryClient);
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Users</h1>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<SkeletonUserList />}>
          {/* Hydrate를 통해 prefetch된 데이터 전달 */}
          <HydrationBoundary state={dehydratedState}>
            {/* 🔹 성능 계측 감싸기 */}
            <PerfMonitor>
              <UsersClient />
            </PerfMonitor>
          </HydrationBoundary>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
