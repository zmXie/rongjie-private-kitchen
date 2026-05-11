import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAdminStore = defineStore('admin', () => {
  const isAdmin = ref(false);

  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');

    if (adminParam) {
      localStorage.setItem('admin-secret', adminParam);
      isAdmin.value = true;
    } else {
      isAdmin.value = false;
    }
  }

  function setAdmin(value: boolean) {
    isAdmin.value = value;
  }

  function logout() {
    localStorage.removeItem('admin-secret');
    isAdmin.value = false;
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  }

  return {
    isAdmin,
    init,
    logout,
    setAdmin,
  };
});