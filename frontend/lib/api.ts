import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export function setAuthHeader(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthHeader() {
  delete api.defaults.headers.common['Authorization'];
}

// Restore auth header from cookie on module load (client-side only).
// This ensures authenticated requests work immediately after a page refresh,
// before AuthContext's useEffect has a chance to run.
if (typeof window !== 'undefined') {
  const token = Cookies.get('token');
  if (token) setAuthHeader(token);
}

export default api;
