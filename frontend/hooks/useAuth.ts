'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { LoginPayload, RegisterPayload } from '@/lib/endpoints';

export function useAuth() {
  const { user, loading, login, register, logout } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (data: LoginPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await login(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (data: RegisterPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await register(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    loading,
    error,
    submitting,
    login: handleLogin,
    register: handleRegister,
    logout,
  };
}
