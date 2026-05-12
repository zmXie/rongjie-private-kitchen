import api from './index';
import type { Category } from '@/types';

export const getCategories = () =>
  api.get<never, Category[]>('/categories');

export const createCategory = (data: { name: string; sort?: number }) =>
  api.post<never, Category>('/categories', data);

export const updateCategory = (id: number, data: { name: string; sort?: number }) =>
  api.put<never, Category>(`/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  api.delete<never, { deleted: boolean }>(`/categories/${id}`);