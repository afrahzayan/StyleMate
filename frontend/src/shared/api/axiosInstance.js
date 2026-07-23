import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Plain axios instance (no interceptors) used only for the refresh call itself,
// so a refresh request can never trigger another refresh.
const refreshClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Decodes a JWT payload without verifying it (verification happens server-side).
// Returns null if the token is missing/malformed so callers can treat it as expired.
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Refreshes the access token if it's missing, expired, or about to expire
// (within 10s), instead of waiting for the server to reject it with a 401.
// Concurrent callers share the same in-flight refresh request.
const ensureFreshAccessToken = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const expiresInMs = payload?.exp ? payload.exp * 1000 - Date.now() : -1;
  if (expiresInMs > 10_000) return token;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const { data } = await refreshClient.post("/auth/refresh-token");
    localStorage.setItem("accessToken", data.accessToken);
    processQueue(null, data.accessToken);
    return data.accessToken;
  } catch (err) {
    processQueue(err, null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw err;
  } finally {
    isRefreshing = false;
  }
};

axiosInstance.interceptors.request.use(async (config) => {
  // Never intercept the refresh call itself.
  if (config.url === "/auth/refresh-token") return config;

  try {
    const token = await ensureFreshAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ensureFreshAccessToken already redirected to /login; let the request
    // fail naturally rather than throwing out of the interceptor.
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/auth/refresh-token") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await refreshClient.post("/auth/refresh-token");
      const newToken = data.accessToken;

      localStorage.setItem("accessToken", newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;