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

export const updateOrderStatus = (id: number, status: number) =>
  api.put<never, Order>(`/orders/${id}/status`, { status });
