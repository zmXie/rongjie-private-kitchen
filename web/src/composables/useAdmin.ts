import api from '@/api';

export function useAdmin() {
  function init() {
    // 不再自动从 URL 或 localStorage 恢复管理员状态
  }

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

  async function showLoginPrompt(): Promise<{ secret: string | null; error: string | null }> {
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
          <div id="error-msg" style="color: #ee0a24; font-size: 12px; margin-top: 8px; display: none;"></div>
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
      const errorMsg = dialog.querySelector('#error-msg') as HTMLDivElement;

      let inputValue = '';
      inputEl.addEventListener('input', (e) => {
        inputValue = (e.target as HTMLInputElement).value;
        errorMsg.style.display = 'none';
      });

      const cleanup = () => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      };

      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve({ secret: null, error: null });
      });

      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '验证中...';

        const success = await login(inputValue);
        cleanup();

        if (success) {
          resolve({ secret: inputValue, error: null });
        } else {
          resolve({ secret: null, error: '密钥错误，请重试' });
        }
      });

      inputEl.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click();
        }
      });

      dialog.querySelector('.admin-login-overlay')?.addEventListener('click', () => {
        cleanup();
        resolve({ secret: null, error: null });
      });

      setTimeout(() => inputEl.focus(), 100);
    });
  }

  return {
    init,
    login,
    showLoginPrompt,
  };
}