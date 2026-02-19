const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const { body, ...rest } = options;

  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      data?.message || `Error ${response.status}`,
      response.status,
      data,
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (endpoint, params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`${endpoint}${query}`);
  },
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
