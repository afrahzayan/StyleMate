import axiosInstance from "../../../services/axiosInstance";

const register = async (userData) => {
  const res = await axiosInstance.post("/auth/register", userData);
  return res.data;
};

const login = async (credentials) => {
  const res = await axiosInstance.post("/auth/login", credentials);
  return res.data;
};

const logout = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};

const forgotPassword = async (email) => {
  const res = await axiosInstance.post("/auth/forgot-password", { email });
  return res.data;
};

const getCurrentUser = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

const authAPI = { register, login, logout, forgotPassword, getCurrentUser };
export default authAPI;