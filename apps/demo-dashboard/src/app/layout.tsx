import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Demo Dashboard',
  description: 'Reference app for api-safety-sdk',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <nav aria-label="주요" className="mx-auto max-w-4xl px-4 py-3">
            <ul className="flex gap-4">
              <li>
                <Link href="/" className="hover:underline">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">
                  로그인
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main id="main" className="mx-auto max-w-4xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
