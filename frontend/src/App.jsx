import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingPage from "./features/marketing/pages/landingPage";

import LoginPage from "./features/auth/pages/loginPage";
import SignupPage from "./features/auth/pages/signupPage";
import VerifyOtpPage from "./features/auth/pages/verifyOtpPage";

import DashboardPage from "./features/user/pages/dashboardPage";

import WardrobePage from "./features/user/pages/wardrobePage";
import AddClothPage from "./features/user/pages/addClothPage";
import ClothDetailPage from "./features/user/pages/clothDetailsPage";

import OutfitsPage from "./features/user/pages/outfitPage";
import OutfitBuilderPage from "./features/user/pages/outfitBuilderPage";

import PlannerPage from "./features/user/pages/plannerPage";

import FavoritesPage from "./features/user/pages/favoritePage";

import AiSuggestionsPage from "./features/user/pages/aiSuggestionsPage";
import AiSuggestionHistoryPage from "./features/user/pages/aiSuggestionHistoryPage";

import CommunityFeedPage from "./features/user/pages/communityFeedPage";
import CreatePostPage from "./features/user/pages/createPostPage";
import PublicProfilePage from "./features/user/pages/publicProfilePage";
import SavedPostsPage from "./features/user/pages/savePostPage";

import AdminDashboardPage from "./features/admin/pages/adminDashboardPage";
import AdminUsersPage from "./features/admin/pages/adminUserPage";
import AdminClothPage from "./features/admin/pages/adminClothPage";
import AdminReportPage from "./features/admin/pages/adminReportPage";
import AdminOrdersPage from "./features/admin/pages/adminOrdersPage";

import NotificationBell from "./features/notifications/components/notificationBell";

import ProfilePage from "./features/user/pages/profilePage";

import StoreHomePage from "./features/store/pages/storeHomePage";

import CustomizationHomePage from "./features/customization/pages/customizationHomePage";
import CustomizeWizardPage from "./features/customization/pages/customizeWizardPage";
import MyDesignsPage from "./features/customization/pages/myDesignsPage";

import CheckoutPage from "./features/checkout/pages/checkoutPage";
import OrderSuccessPage from "./features/checkout/pages/orderSuccessPage";

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return children;
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
};

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {user && <NotificationBell />}
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

        <Route
          path="/community"
          element={
            <PrivateRoute>
              <CommunityFeedPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/community/create"
          element={
            <PrivateRoute>
              <CreatePostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/community/profile/:username"
          element={
            <PrivateRoute>
              <PublicProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/community/saved"
          element={
            <PrivateRoute>
              <SavedPostsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/clothes"
          element={
            <AdminRoute>
              <AdminClothPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReportPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/store"
          element={
            <PrivateRoute>
              <StoreHomePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/customize"
          element={
            <PrivateRoute>
              <CustomizationHomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/customize/new"
          element={
            <PrivateRoute>
              <CustomizeWizardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/designs/saved"
          element={
            <PrivateRoute>
              <MyDesignsPage view="saved" />
            </PrivateRoute>
          }
        />
        <Route
          path="/designs/history"
          element={
            <PrivateRoute>
              <MyDesignsPage view="history" />
            </PrivateRoute>
          }
        />
        <Route
          path="/designs/orders"
          element={
            <PrivateRoute>
              <MyDesignsPage view="orders" />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <MyDesignsPage view="orders" />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <PrivateRoute>
              <OrderSuccessPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;