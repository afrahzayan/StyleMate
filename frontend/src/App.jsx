import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingPage from "./features/marketing/pages/landingPage";

import LoginPage     from "./features/auth/pages/loginPage";
import SignupPage    from "./features/auth/pages/signupPage";
import VerifyOtpPage from "./features/auth/pages/verifyOtpPage";

import DashboardPage from "./features/user/pages/dashboardPage";

import WardrobePage    from "./features/user/pages/wardrobePage";
import AddClothPage    from "./features/user/pages/addClothPage";
import ClothDetailPage from "./features/user/pages/clothDetailsPage";

import OutfitsPage       from "./features/user/pages/outfitpage";
import OutfitBuilderPage from "./features/user/pages/outfitBuilderPage";

import PlannerPage from "./features/user/pages/plannerPage";

import FavoritesPage from "./features/user/pages/favoritePage";

import AiSuggestionsPage from "./features/user/pages/aiSuggestionsPage";
import AiSuggestionHistoryPage from "./features/user/pages/aiSuggestionHistoryPage";

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

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

      <Route
        path="/planner"
        element={
          <PrivateRoute>
            <PlannerPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <FavoritesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/ai-suggestions"
        element={
          <PrivateRoute>
            <AiSuggestionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/ai-suggestions/history"
        element={
          <PrivateRoute>
            <AiSuggestionHistoryPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;