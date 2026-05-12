import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAdminStore = defineStore('admin', () => {
  const isAdmin = ref(false);

  async function init() {
    const secret = localStorage.getItem('admin-secret');
    if (secret) {
      try {
        const res = await fetch('/api/admin/check', {
          headers: { 'x-admin-secret': secret },
        });
        if (res.ok) {
          isAdmin.value = true;
          return;
        }
        // 仅密钥无效时才清除，网络错误保留
        if (res.status === 401) {
          localStorage.removeItem('admin-secret');
        }
      } catch {
        // 网络错误，保留密钥，下次重试
      }
    }
    isAdmin.value = false;
  }

  function setAdmin(value: boolean) {
    isAdmin.value = value;
  }

  function logout() {
    isAdmin.value = false;
  }

  return {
    isAdmin,
    init,
    logout,
    setAdmin,
  };
});
