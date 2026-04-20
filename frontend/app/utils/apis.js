import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";
console.log("BASE_URL:", BASE_URL);
// Main axios instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach access token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh already running → queue request
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        } catch (err) {
          console.log(err)
          throw err;
        }
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post(
          `${BASE_URL}/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = res.data.access;

        localStorage.setItem("accessToken", newAccessToken);

        axiosClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        globalThis.location.href = "/";

        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);

export default axiosClient;