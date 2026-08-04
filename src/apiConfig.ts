const RAILWAY_API_BASE_URL = "https://space-weather-app-production-48ab.up.railway.app";
const LOCAL_API_BASE_URL = "http://127.0.0.1:5000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  (import.meta.env.DEV ? LOCAL_API_BASE_URL : RAILWAY_API_BASE_URL);

export function getApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
