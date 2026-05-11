export async function onRequest(context) {
  const filename = context.params.filename;

  const response = await fetch(
    `https://rongjie-api.741937337.workers.dev/r2/${filename}`,
    {
      method: context.request.method,
      headers: context.request.headers,
    }
  );

  return response;
}
