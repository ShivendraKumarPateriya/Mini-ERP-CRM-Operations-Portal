import type { Challan, Customer, Product, StockMovement } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export const customersApi = {
  list: (params?: Record<string, unknown>) => apiGet<Customer[]>('/customers', params),
  detail: (id: string) => apiGet<Customer>(`/customers/${id}`).then((res) => res.data),
  create: (body: Partial<Customer>) => apiPost<Customer>('/customers', body).then((res) => res.data),
  update: (id: string, body: Partial<Customer>) => apiPut<Customer>(`/customers/${id}`, body).then((res) => res.data),
  remove: (id: string) => apiDelete<Customer>(`/customers/${id}`).then((res) => res.data),
  addFollowUp: (id: string, note: string) => apiPost(`/customers/${id}/followups`, { note })
};

export const productsApi = {
  list: (params?: Record<string, unknown>) => apiGet<Product[]>('/products', params),
  detail: (id: string) => apiGet<Product>(`/products/${id}`).then((res) => res.data),
  create: (body: Partial<Product>) => apiPost<Product>('/products', body).then((res) => res.data),
  update: (id: string, body: Partial<Product>) => apiPut<Product>(`/products/${id}`, body).then((res) => res.data),
  adjustStock: (body: { productId: string; quantity: number; type: 'IN' | 'OUT'; reason: string }) =>
    apiPost<StockMovement>('/stock/movement', body).then((res) => res.data)
};

export const challansApi = {
  list: (params?: Record<string, unknown>) => apiGet<Challan[]>('/challans', params),
  detail: (id: string) => apiGet<Challan>(`/challans/${id}`).then((res) => res.data),
  create: (body: { customerId: string; status: 'DRAFT' | 'CONFIRMED'; items: Array<{ productId: string; quantity: number }> }) =>
    apiPost<Challan>('/challans', body).then((res) => res.data),
  confirm: (id: string) => apiPut<Challan>(`/challans/${id}/confirm`).then((res) => res.data),
  cancel: (id: string) => apiPut<Challan>(`/challans/${id}/cancel`).then((res) => res.data)
};
