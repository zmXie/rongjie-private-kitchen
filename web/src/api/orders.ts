import api from './index';
import type { Order } from '@/types';

export const createOrder = (data: {
  items: { dish_id: number | null; dish_name: string; dish_price: number; quantity: number }[];
  remark?: string;
  total_price: number;
}) => api.post<never, Order>('/orders', data);

export const getOrder = (id: number) =>
  api.get<never, Order>(`/orders/${id}`);

export const getOrders = (status?: number) => {
  const params = status !== undefined ? { status } : {};
  return api.get<never, Order[]>('/orders', { params });
};

export const updateOrderStatus = (id: number, status: number, reject_reason?: string) =>
  api.put<never, Order>(`/orders/${id}/status`, { status, reject_reason });

export const submitReview = (id: number, data: { rating: number; review?: string }) =>
  api.post<never, Order>(`/orders/${id}/review`, data);
