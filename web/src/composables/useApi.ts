import api from '@/api';

export function useApi() {
  async function get<T>(url: string) {
    try {
      return await api.get<never, T>(url);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async function post<T>(url: string, data?: any) {
    try {
      return await api.post<never, T>(url, data);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async function put<T>(url: string, data?: any) {
    try {
      return await api.put<never, T>(url, data);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async function del<T>(url: string) {
    try {
      return await api.delete<never, T>(url);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  return {
    get,
    post,
    put,
    del,
  };
}