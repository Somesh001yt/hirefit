'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

const accent = '#6366f1';
const ink = '#10131c';
const sub = '#5a6072';
const line = '#e6e7ec';

export default function LoginPage() {
  const { login, submitting, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    await login({ email, password });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f6f9', fontFamily: "'Manrope', sans-serif", padding: '24px 16px' }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32, textDecoration: 'none' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 14, height: 14, border: '2.5px solid #fff', borderRadius: 2, transform: 'rotate(45deg)' }} />
        </div>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: ink }}>HireFit</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: ink, margin: 0 }}>Welcome back</h1>
          <p style={{ marginTop: 6, fontSize: 14.5, color: sub, fontWeight: 500 }}>Sign in to optimize your resume</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${line}`, padding: '32px 28px', boxShadow: '0 4px 24px -8px rgba(16,19,28,0.08)' }}>
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, padding: '12px 14px', border: `1px solid ${line}`, borderRadius: 10, outline: 'none', color: ink, background: '#fff', transition: 'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = accent)}
                onBlur={e => (e.currentTarget.style.borderColor = line)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, padding: '12px 14px', border: `1px solid ${line}`, borderRadius: 10, outline: 'none', color: ink, background: '#fff', transition: 'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = accent)}
                onBlur={e => (e.currentTarget.style.borderColor = line)}
              />
            </div>
            {error && <p style={{ fontSize: 13.5, color: '#dc2626', fontWeight: 600, textAlign: 'center', margin: 0 }}>{error}</p>}
            <Button type="submit" loading={submitting} fullWidth size="lg">
              {submitting ? 'Signing in…' : 'Sign in →'}
            </Button>
          </form>

          <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13.5, color: sub, fontWeight: 500 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ fontWeight: 700, color: accent, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
