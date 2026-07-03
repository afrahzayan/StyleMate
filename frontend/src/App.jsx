import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Marketing ─────────────────────────────────────────────
import LandingPage from "./features/marketing/pages/landingPage";

// ── Auth ──────────────────────────────────────────────────
import LoginPage  from "./features/auth/pages/loginPage";
import SignupPage from "./features/auth/pages/signupPage";

// ── Placeholder until you build the real dashboard ────────
const Dashboard = () => (
  <div
    className="flex flex-col items-center justify-center h-screen gap-4"
    style={{ backgroundColor: "#faf8f5" }}
  >
    <span className="text-6xl">🎉</span>
    <h1 className="text-3xl font-extrabold" style={{ color: "#4a5280" }}>
      Welcome to StyleMate!
    </h1>
    <p className="text-gray-500 text-sm">Your dashboard is coming soon.</p>
  </div>
);

// ── Route Guards ───────────────────────────────────────────

// Stops logged-in users from going back to /login or /signup
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Stops logged-out users from reaching protected pages
const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

// ── App ────────────────────────────────────────────────────
const App = () => {
  return (
    <Routes>
      {/* Public — marketing landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public — auth pages (redirect to dashboard if already logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Private — protected user area */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Catch-all — unknown URLs go back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;