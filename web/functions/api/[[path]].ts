const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  'Access-Control-Max-Age': '86400'
};

function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export const onRequest: PagesFunction = async context => {
  if (context.request.method === 'OPTIONS') {
    return handleOptions();
  }

  const url = new URL(context.request.url);

  // 去掉 /api 前缀
  const path = url.pathname.replace(/^\/api/, '');

  const targetUrl = `https://rongjie-api.741937337.workers.dev/api` + `${path}${url.search}`;

  const request = new Request(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method === 'GET' || context.request.method === 'HEAD' ? undefined : context.request.body,
    redirect: 'follow'
  });

  const response = await fetch(request);

  const headers = new Headers(response.headers);

  // 添加 CORS 响应头（其实同域时不是必须，但保留也无妨）
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
