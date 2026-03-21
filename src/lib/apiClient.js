const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseJson(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

function createApiError(response, payload) {
  const error = new Error(payload?.error?.message || payload?.message || 'Richiesta non riuscita.');
  error.status = response.status;
  error.code = payload?.error?.code || payload?.code || 'API_ERROR';
  error.details = payload?.error?.details || payload?.details || null;
  return error;
}

export async function apiGet(path) {
  const response = await fetch(buildUrl(path), {
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw createApiError(response, payload);
  }

  return payload;
}

export async function apiPost(path, body) {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw createApiError(response, payload);
  }

  return payload;
}
