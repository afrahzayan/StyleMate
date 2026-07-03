import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:6000/api",
  withCredentials: true, // sends cookies (refresh token) automatically
});

// Attach access token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;