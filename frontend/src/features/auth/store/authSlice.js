import { createSlice } from "@reduxjs/toolkit";

// On page refresh, restore state from localStorage if available
const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("accessToken");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedToken || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called before any API request starts
    setLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    // Called when a request finishes successfully but doesn't log the user in
    // (e.g. register() — OTP was sent, but there's no user/token yet).
    // Without this, isLoading stays stuck at `true` from setLoading() and
    // carries over into whatever page the user is navigated to next.
    stopLoading(state) {
      state.isLoading = false;
    },

    // Called when login or verify-OTP succeeds
    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("accessToken", action.payload.accessToken);
    },

    // Called when any API request fails
    setError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Called on logout
    logoutSuccess(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    },

    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  stopLoading,
  loginSuccess,
  setError,
  logoutSuccess,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;