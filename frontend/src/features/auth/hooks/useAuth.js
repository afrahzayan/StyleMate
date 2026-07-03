import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../shared/api/axiosInstance";
import {
  setLoading,
  loginSuccess,
  setError,
  logoutSuccess,
} from "../store/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  // ── REGISTER ──────────────────────────────────────────────
  // Returns { success: true } if API accepted the request and OTP was sent
  const register = async (name, email, password) => {
    dispatch(setLoading());
    try {
      const res = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      dispatch(setError(msg));
      return { success: false, message: msg };
    }
  };

  // ── VERIFY OTP ────────────────────────────────────────────
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

  // ── RESEND OTP ────────────────────────────────────────────
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

  // ── LOGIN ─────────────────────────────────────────────────
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

  // ── GOOGLE LOGIN ──────────────────────────────────────────
  // Sends the Google credential token to our backend for verification
  const googleLogin = async (googleCredential) => {
    dispatch(setLoading());
    try {
      const res = await axiosInstance.post("/auth/google", {
        credential: googleCredential,
      });
      dispatch(
        loginSuccess({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Google login failed";
      dispatch(setError(msg));
      return { success: false, message: msg };
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (_) {
      // even if API fails, clear local state
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
    googleLogin,
    logout,
  };
};

export default useAuth;