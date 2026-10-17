import axios from 'axios';

// Set VITE_API_URL at BUILD time (Netlify: Site settings > Environment variables),
// e.g. https://your-service.onrender.com/api  (must end in /api).
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
  // Render's free tier can take ~50s to wake up, so be patient.
  timeout: 60000,
});

// Attach the Sanctum bearer token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_PATHS = ['/login', '/register'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;

    // 1) A sleeping or restarting server shows up as a network error or 502/503/504.
    //    Quietly retry safe (GET) requests a couple of times before giving up.
    const transient = !response || [502, 503, 504].includes(response.status);
    if (config && config.method === 'get' && transient && (config.__retries || 0) < 2) {
      config.__retries = (config.__retries || 0) + 1;
      await wait(2500 * config.__retries);
      return api(config);
    }

    // 2) The token is no longer valid: forget it and tell the app to sign out.
    //    (Only an actual 401 does this, never a network blip.)
    if (response?.status === 401 && config?.headers?.Authorization && !AUTH_PATHS.includes(config.url)) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }

    return Promise.reject(error);
  }
);

// Laravel validation errors look like { errors: { field: ['message'] } }
export const fieldErrors = (e) =>
  Object.fromEntries(Object.entries(e?.response?.data?.errors || {}).map(([k, v]) => [k, v[0]]));

export const errMsg = (e) => {
  if (!e?.response) return "Can't reach the server. It may be waking up, so please try again in a few seconds.";
  return e.response.data?.message || 'Something went wrong.';
};

export default api;
