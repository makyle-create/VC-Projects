import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

// Attach the Sanctum bearer token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Laravel validation errors look like { errors: { field: ['message'] } }
export const fieldErrors = (e) =>
  Object.fromEntries(Object.entries(e?.response?.data?.errors || {}).map(([k, v]) => [k, v[0]]));
export const errMsg = (e) => e?.response?.data?.message || 'Something went wrong.';

export default api;
