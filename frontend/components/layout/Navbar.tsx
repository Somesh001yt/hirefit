'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-primary">
              JobTracker AI
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/ai-match', label: 'AI Match' },
                { href: '/resume-builder', label: 'Resume Builder' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-background text-text-primary'
                      : 'text-(--color-text-secondary) hover:text-text-primary',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:block text-sm text-(--color-text-secondary)">
                {user.name}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
