import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Marketing ─────────────────────────────────────────────
import LandingPage from "./features/marketing/pages/landingPage";

// ── Auth ──────────────────────────────────────────────────
import LoginPage     from "./features/auth/pages/loginPage";
import SignupPage    from "./features/auth/pages/signupPage";
import VerifyOtpPage from "./features/auth/pages/verifyOtpPage";

// ── Dashboard ────────────────────────────────────────────
import DashboardPage from "./features/user/pages/dashboardPage";

// ── Wardrobe ─────────────────────────────────────────────
import WardrobePage    from "./features/user/pages/wardrobePage";
import AddClothPage    from "./features/user/pages/addClothPage";
import ClothDetailPage from "./features/user/pages/clothDetailsPage";

// ── Outfits ──────────────────────────────────────────────
import OutfitsPage       from "./features/user/pages/outfitpage";
import OutfitBuilderPage from "./features/user/pages/outfitBuilderPage";

// ── Planner ──────────────────────────────────────────────
import PlannerPage from "./features/user/pages/plannerPage";

// ── Favorites ────────────────────────────────────────────
import FavoritesPage from "./features/user/pages/favoritePage";

// ── Route Guards ───────────────────────────────────────────

// Stops logged-in users from going back to /login, /signup, /verify-otp
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
      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <VerifyOtpPage />
          </PublicRoute>
        }
      />

      {/* Private — protected user area */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/wardrobe"
        element={
          <PrivateRoute>
            <WardrobePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/wardrobe/add"
        element={
          <PrivateRoute>
            <AddClothPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/wardrobe/:id"
        element={
          <PrivateRoute>
            <ClothDetailPage />
          </PrivateRoute>
        }
      />

      {/* Private — outfits */}
      <Route
        path="/outfits"
        element={
          <PrivateRoute>
            <OutfitsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/outfits/new"
        element={
          <PrivateRoute>
            <OutfitBuilderPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/outfits/:id/edit"
        element={
          <PrivateRoute>
            <OutfitBuilderPage />
          </PrivateRoute>
        }
      />

      {/* Private — planner */}
      <Route
        path="/planner"
        element={
          <PrivateRoute>
            <PlannerPage />
          </PrivateRoute>
        }
      />

      {/* Private — favorites */}
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <FavoritesPage />
          </PrivateRoute>
        }
      />

      {/* Catch-all — unknown URLs go back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;