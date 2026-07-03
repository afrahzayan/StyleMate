import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
} from "../store/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, status, error, message } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    isAuthenticated,
    isLoading: status === "loading",
    error,
    message,
    register: (data) => dispatch(registerUser(data)),
    login: (data) => dispatch(loginUser(data)),
    logout: () => dispatch(logoutUser()),
    forgotPassword: (email) => dispatch(forgotPassword(email)),
  };
};

export default useAuth;