import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // needed if backend sends the JWT as an httpOnly cookie
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;