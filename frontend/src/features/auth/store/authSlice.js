import { createSlice } from "@reduxjs/toolkit";

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
    setLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("accessToken", action.payload.accessToken);
    },

    setError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

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