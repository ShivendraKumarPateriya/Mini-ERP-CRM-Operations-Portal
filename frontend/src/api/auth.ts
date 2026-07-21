import type { User } from '../types';
import { apiGet, apiPost } from './client';

export type LoginResponse = {
  token: string;
  user: User;
};

export const authApi = {
  login: (email: string, password: string) =>
    apiPost<LoginResponse>('/auth/login', { email, password }).then((res) => res.data),
  me: () => apiGet<{ user: User }>('/auth/me').then((res) => res.data.user)
};
