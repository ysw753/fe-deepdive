'use client';

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 text-red-600 border border-red-300 bg-red-50 rounded">
      <h2 className="font-bold">❌ 에러 발생</h2>
      <p>{error.message}</p>
    </div>
  );
}
