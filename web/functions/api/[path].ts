const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  'Access-Control-Max-Age': '86400',
};

function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return handleOptions();
  }

  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api/', '');

  const headers: HeadersInit = {
    'x-admin-secret': context.request.headers.get('x-admin-secret') || '',
    'Content-Type': context.request.headers.get('content-type') || 'application/json',
  };

  let body = undefined;
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    body = await context.request.arrayBuffer();
  }

  const response = await fetch(
    `https://rongjie-api.741937337.workers.dev/api/${path}${url.search}`,
    {
      method: context.request.method,
      headers,
      body,
    }
  );

  const newHeaders = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
