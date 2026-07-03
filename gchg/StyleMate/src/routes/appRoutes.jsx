import { Routes, Route } from "react-router-dom";
import LandingPage from "../features/marketing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* user & admin dashboard routes go here later, wrapped in ProtectedRoute */}
    </Routes>
  );
};

export default AppRoutes;