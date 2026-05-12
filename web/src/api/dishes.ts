import api from './index';
import type { Dish } from '@/types';

export const getDishes = (categoryId?: number) => {
  const params = categoryId ? { category_id: categoryId } : {};
  return api.get<never, Dish[]>('/dishes', { params });
};

export const createDish = (data: {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  sort?: number;
  status?: number;
}) => api.post<never, Dish>('/dishes', data);

export const updateDish = (id: number, data: Partial<Dish>) =>
  api.put<never, Dish>(`/dishes/${id}`, data);

export const deleteDish = (id: number) =>
  api.delete<never, { deleted: boolean }>(`/dishes/${id}`);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<never, { url: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};