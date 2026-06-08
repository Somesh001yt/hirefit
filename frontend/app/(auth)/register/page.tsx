'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text-primary">{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required
        className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
      />
    </div>
  );
}

export default function RegisterPage() {
  const { register, submitting, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    await register({ name, email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-6">
      <Link href="/" className="flex items-center gap-2 mb-8 no-underline">
        <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center">
          <div className="w-3.5 h-3.5 border-[2.5px] border-white rounded-sm rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-head)' }}>HireFit</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create an account</h1>
          <p className="mt-1.5 text-sm font-medium text-text-secondary">Start optimizing your resume for free</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
            <Field label="Full name" type="text" placeholder="Your name" value={name} onChange={setName} />
            <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <Field label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
            {error && <p className="text-sm text-danger font-semibold text-center">{error}</p>}
            <Button type="submit" loading={submitting} fullWidth size="lg">
              {submitting ? 'Creating account…' : 'Create account →'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary no-underline hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
