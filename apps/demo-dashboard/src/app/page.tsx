import Link from 'next/link';

export default function Home() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Demo Dashboard</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        레퍼런스 앱입니다. 로그인 또는 회원가입 폼으로 이동해 SDK 동작을 확인하세요.
      </p>
      <p>
        <Link href="/login" className="text-blue-600 hover:underline">
          /login 으로 이동
        </Link>
        <Link href="/signup" className="text-blue-600 hover:underline">
          /signup 으로 이동
        </Link>
      </p>
    </section>
  );
}
