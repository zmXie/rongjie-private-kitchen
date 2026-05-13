import type { R2Bucket } from '@cloudflare/workers-types';

/** 环境变量类型定义 */
export type Env = {
  DB: D1Database;
  IMAGES: R2Bucket;
  ADMIN_SECRET: string;
  PUBLIC_R2_URL: string;
  CONTACT_PHONE: string;
  CONTACT_WECHAT: string;
};

/** 成功响应封装 */
export const successResponse = <T>(data: T) => ({
  code: 0,
  message: 'success',
  data
});

/** 错误响应封装 */
export const errorResponse = (message: string, code = 1) => ({
  code,
  message,
  data: null as null
});

/** 从 image_url 提取 R2 对象 key，仅匹配本桶域名 */
export const extractR2Key = (imageUrl: string | null | undefined, publicR2Url: string): string | null => {
  if (!imageUrl || !publicR2Url) return null;
  if (!imageUrl.startsWith(publicR2Url + '/')) return null;
  return imageUrl.slice(publicR2Url.length + 1);
};

/** 从 R2 删除单个图片，失败不阻塞主流程 */
export const deleteR2Image = async (bucket: R2Bucket, key: string) => {
  try {
    await bucket.delete(key);
  } catch {}
};
