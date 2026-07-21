import axios from 'axios';
import type { ApiResult } from '../types';

const fallbackApiUrl = import.meta.env.PROD
  ? 'https://mini-erp-crm-operations-portal-rq8f.onrender.com/api/v1'
  : 'http://localhost:3001/api/v1';

export const API_URL = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('opspro-auth');
  const token = stored ? JSON.parse(stored).state?.token : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiGet<T>(path: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get<ApiResult<T>>(path, { params });
  return data;
}

export async function apiPost<T>(path: string, body: unknown) {
  const { data } = await apiClient.post<ApiResult<T>>(path, body);
  return data;
}

export async function apiPut<T>(path: string, body?: unknown) {
  const { data } = await apiClient.put<ApiResult<T>>(path, body ?? {});
  return data;
}

export async function apiDelete<T>(path: string) {
  const { data } = await apiClient.delete<ApiResult<T>>(path);
  return data;
}

export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
