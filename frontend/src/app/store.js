import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice";

// As you add more features (user, admin etc), import their slices here
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;