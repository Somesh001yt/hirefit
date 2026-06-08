'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  authEndpoints,
  UserResponse,
  LoginPayload,
  RegisterPayload,
} from '@/lib/endpoints';
import api, { setAuthHeader, clearAuthHeader } from '@/lib/api';

const USER_CACHE_KEY = 'auth_user';

function saveUserCache(user: UserResponse) {
  try { localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user)); } catch { /* ignore */ }
}

function loadUserCache(): UserResponse | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch { return null; }
}

function clearUserCache() {
  try { localStorage.removeItem(USER_CACHE_KEY); } catch { /* ignore */ }
}

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ping backend health on every page load to wake it up from free-tier sleep
    // before the user submits a form (fire-and-forget, errors are ignored)
    api.get('/health').catch(() => {});

    const token = Cookies.get('token');

    if (!token) {
      setLoading(false);
      return;
    }

    // Ensure the axios default header is set (module-load already does this,
    // but guard against any edge case where it wasn't applied yet).
    setAuthHeader(token);

    // Restore from localStorage immediately — no network round-trip on refresh.
    const cached = loadUserCache();
    if (cached) {
      setUser(cached);
      setLoading(false);
      return;
    }

    // No cache (e.g. user cleared storage) — fall back to /auth/me.
    authEndpoints
      .me()
      .then((res) => {
        setUser(res.data);
        saveUserCache(res.data);
      })
      .catch((e: { response?: { status?: number } }) => {
        // Only evict on a real 401 — not a network error or backend hiccup.
        if (e?.response?.status === 401) {
          Cookies.remove('token');
          clearAuthHeader();
          clearUserCache();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data: LoginPayload) => {
    const res = await authEndpoints.login(data);
    Cookies.set('token', res.data.access_token, { expires: 7 });
    setAuthHeader(res.data.access_token);
    saveUserCache(res.data.user);
    setUser(res.data.user);
    router.push('/analyze');
  };

  const register = async (data: RegisterPayload) => {
    const res = await authEndpoints.register(data);
    Cookies.set('token', res.data.access_token, { expires: 7 });
    setAuthHeader(res.data.access_token);
    saveUserCache(res.data.user);
    setUser(res.data.user);
    router.push('/analyze');
  };

  const logout = () => {
    Cookies.remove('token');
    clearAuthHeader();
    clearUserCache();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
