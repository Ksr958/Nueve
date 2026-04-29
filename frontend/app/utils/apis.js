import axios from "axios";

function resolveApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (globalThis.window) {
  const { hostname } = globalThis.window.location;
  return `http://${hostname}:8000/api`;
}

  return "http://localhost:8000/api";
}

const apiBaseUrl = resolveApiBaseUrl();
const derivedApiOrigin = apiBaseUrl.endsWith("/api")
  ? apiBaseUrl.slice(0, -4)
  : apiBaseUrl;
const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || derivedApiOrigin;

export function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (!apiOrigin) return path;
  return `${apiOrigin}${path}`;
}

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && globalThis.window?.location.pathname !== "/") {
      globalThis.window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
