export function useAdmin() {
  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');

    if (adminParam) {
      localStorage.setItem('admin-secret', adminParam);
    }
  }

  function isAdminMode(): boolean {
    return !!localStorage.getItem('admin-secret');
  }

  function logout() {
    localStorage.removeItem('admin-secret');
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  }

  function login(secret: string) {
    localStorage.setItem('admin-secret', secret);
  }

  async function showLoginPrompt(): Promise<string | null> {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.className = 'admin-login-dialog';
      dialog.innerHTML = `
        <div class="admin-login-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
        <div class="admin-login-content" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 8px; width: 80%; max-width: 320px; z-index: 2001; padding: 24px 16px;">
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; text-align: center;">请输入管理员密钥</div>
          <input
            type="password"
            placeholder="请输入管理员密钥"
            id="admin-secret-input"
            style="width: 100%; padding: 10px 12px; border: 1px solid #dcdee0; border-radius: 4px; font-size: 14px; box-sizing: border-box; outline: none;"
          />
          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button class="admin-login-cancel" style="flex: 1; padding: 10px; border: 1px solid #dcdee0; background: #fff; border-radius: 4px; font-size: 14px; cursor: pointer;">取消</button>
            <button class="admin-login-confirm" style="flex: 1; padding: 10px; border: none; background: #1989fa; color: #fff; border-radius: 4px; font-size: 14px; cursor: pointer;">确定</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);

      const inputEl = dialog.querySelector('#admin-secret-input') as HTMLInputElement;
      const cancelBtn = dialog.querySelector('.admin-login-cancel') as HTMLButtonElement;
      const confirmBtn = dialog.querySelector('.admin-login-confirm') as HTMLButtonElement;

      let inputValue = '';
      inputEl.addEventListener('input', (e) => {
        inputValue = (e.target as HTMLInputElement).value;
      });

      const cleanup = () => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      };

      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });

      confirmBtn.addEventListener('click', () => {
        cleanup();
        resolve(inputValue || null);
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          cleanup();
          resolve(inputValue || null);
        }
      });

      dialog.querySelector('.admin-login-overlay')?.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });

      setTimeout(() => inputEl.focus(), 100);
    });
  }

  return {
    init,
    isAdminMode,
    logout,
    login,
    showLoginPrompt,
  };
}