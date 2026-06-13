import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  jd_url?: string;
  notes?: string;
  applied_at?: string;
  created_at: string;
}

export interface ApplicationPayload {
  company: string;
  role: string;
  status: ApplicationStatus;
  jd_url?: string;
  notes?: string;
  applied_at?: string;
}

export interface MatchPayload {
  resume_text: string;
  jd_text: string;
  application_id?: string;
}

export interface RewritePayload {
  resume_summary: string;
  jd_text: string;
}

export interface MatchResponse {
  id: string;
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  recommendation: string;
}

export interface RewriteResponse {
  rewritten_summary: string;
}

export interface RewriteFullPayload {
  resume_text: string;
  jd_text: string;
  missing_keywords: string[];
}

export interface RewriteFullResponse {
  rewritten_resume: unknown;
}

export interface AiAnalysis {
  id: string;
  score?: number;
  matched_keywords?: string[];
  missing_keywords?: string[];
  recommendation?: string;
  rewritten_summary?: string;
  created_at: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const authEndpoints = {
  register: (data: RegisterPayload) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginPayload) => api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<UserResponse>('/auth/me'),
};

export const applicationEndpoints = {
  list: (status?: string) =>
    api.get<Application[]>('/applications', { params: status ? { status } : undefined }),
  create: (data: ApplicationPayload) => api.post<Application>('/applications', data),
  update: (id: string, data: Partial<ApplicationPayload>) =>
    api.patch<Application>(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
};

export const aiEndpoints = {
  match: (data: MatchPayload) => api.post<MatchResponse>('/ai/match', data),
  rewrite: (data: RewritePayload) => api.post<RewriteResponse>('/ai/rewrite', data),
  rewriteResume: (data: RewriteFullPayload) => api.post<RewriteFullResponse>('/ai/rewrite-resume', data),
  history: () => api.get<AiAnalysis[]>('/ai/history'),
};
