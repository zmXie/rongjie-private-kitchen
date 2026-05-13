import api from './index';

interface SiteConfig {
  phone: string;
  wechat: string;
}

export const getConfig = () => api.get<never, SiteConfig>('/config');
