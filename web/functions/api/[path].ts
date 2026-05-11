export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api/', '');

  const headers: HeadersInit = {
    'x-admin-secret': context.request.headers.get('x-admin-secret') || '',
  };

  const contentType = context.request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    headers['Content-Type'] = contentType;
  }

  const response = await fetch(
    `https://rongjie-api.741937337.workers.dev/api/${path}${url.search}`,
    {
      method: context.request.method,
      headers,
      body: context.request.body,
    }
  );

  return response;
}
