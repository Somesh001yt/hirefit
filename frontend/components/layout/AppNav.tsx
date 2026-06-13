'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/analyze', label: 'Analyze' },
  { href: '/applications', label: 'Applications' },
  { href: '/history', label: 'History' },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, border: '2.5px solid #fff', borderRadius: 2, transform: 'rotate(45deg)' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--rl-ink)' }}>
        HireFit
      </span>
    </div>
  );
}

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--rl-line)',
      /* needed so the absolute dropdown is positioned relative to the nav bar */
      isolation: 'isolate',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Left: logo */}
        <Logo onClick={() => router.push('/')} />

        {/* Center: nav links — desktop only */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                style={{
                  fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  padding: '7px 14px', borderRadius: 8,
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--rl-sub)',
                  transition: 'background .15s, color .15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Greeting — hidden on mobile */}
          {user && (
            <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-head)', fontSize: 13.5, fontWeight: 600, color: 'var(--rl-sub)' }}>
              Hi, {user.name.split(' ')[0]}
            </span>
          )}

          {/* Logout — desktop only; wrapper div carries the Tailwind class so inline display doesn't fight it */}
          <div className="hidden md:block">
            <button
              onClick={logout}
              style={{
                fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700,
                color: 'var(--rl-sub)', background: 'transparent',
                border: '1px solid var(--rl-line)', borderRadius: 8,
                padding: '7px 14px', cursor: 'pointer', minHeight: 36,
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              Logout
            </button>
          </div>

          {/* Hamburger — mobile only; wrapper div carries the Tailwind class */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                background: menuOpen ? 'var(--accent-soft)' : 'transparent',
                border: '1px solid var(--rl-line)',
                borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              {menuOpen ? (
                /* X icon when open */
                <span style={{ display: 'block', fontSize: 18, lineHeight: 1, color: 'var(--accent)', fontWeight: 700, width: 18, textAlign: 'center' }}>✕</span>
              ) : (
                /* Three bars when closed */
                [0, 1, 2].map(i => (
                  <span key={i} style={{ display: 'block', width: 18, height: 2, background: 'var(--rl-ink)', borderRadius: 99 }} />
                ))
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown — absolutely positioned so it overlays page content */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 19,
            borderTop: '1px solid var(--rl-line)',
            background: '#fff',
            boxShadow: '0 8px 24px -4px rgba(16,19,28,0.12)',
            padding: '12px 20px 16px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setMenuOpen(false); }}
                style={{
                  fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
                  padding: '11px 12px', borderRadius: 8, textAlign: 'left',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--rl-ink)',
                }}
              >
                {label}
              </button>
            );
          })}

          {/* Greeting + Logout row */}
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--rl-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {user && (
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 13.5, fontWeight: 600, color: 'var(--rl-sub)' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
            )}
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              style={{
                fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700,
                color: '#dc2626', background: '#fff1f2',
                border: '1px solid #fecaca', borderRadius: 8,
                padding: '8px 14px', cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
