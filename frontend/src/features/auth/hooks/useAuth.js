import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../shared/api/axiosInstance";
import {
  setLoading,
  stopLoading,
  loginSuccess,
  setError,
  logoutSuccess,
} from "../store/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const register = async (name, email, password) => {
    dispatch(setLoading());
    try {
      const res = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      dispatch(stopLoading());
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      dispatch(setError(msg));
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email, otp) => {
    dispatch(setLoading());
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      dispatch(
        loginSuccess({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      dispatch(setError(msg));
      return { success: false, message: msg };
    }
  };

  const resendOtp = async (email) => {
    try {
      await axiosInstance.post("/auth/resend-otp", { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to resend",
      };
    }
  };

  const login = async (email, password) => {
    dispatch(setLoading());
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      dispatch(
        loginSuccess({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      dispatch(setError(msg));
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (_) {
    }
    dispatch(logoutSuccess());
  };

  return {
    user,
    isLoading,
    error,
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
  };
};

export default useAuth;