import api from '@/api';

export function useAdmin() {
  async function validateSecret(secret: string): Promise<boolean> {
    try {
      await api.get('/admin/check', {
        headers: { 'x-admin-secret': secret },
      });
      return true;
    } catch {
      return false;
    }
  }

  async function login(secret: string): Promise<boolean> {
    const isValid = await validateSecret(secret);
    if (isValid) {
      localStorage.setItem('admin-secret', secret);
      return true;
    }
    return false;
  }

  return {
    login,
    validateSecret,
  };
}
