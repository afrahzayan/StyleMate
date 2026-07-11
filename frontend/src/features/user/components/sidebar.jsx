import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  Layers,
  CalendarDays,
  Heart,
  Sparkles,
  Users,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";
// Sidebar lives in user/components → auth/hooks is two levels up then into auth
import useAuth from "../../auth/hooks/useAuth";

const navItems = [
  { label: "Dashboard",      icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Wardrobe",    icon: Shirt,           path: "/wardrobe" },
  { label: "Outfits",        icon: Layers,          path: "/outfits" },
  { label: "Planner",        icon: CalendarDays,    path: "/planner" },
  { label: "Favorites",      icon: Heart,           path: "/favorites" },
  { label: "AI Suggestions", icon: Sparkles,        path: "/ai-suggestions" },
  { label: "Community Feed", icon: Users,           path: "/community" },
  { label: "Store",          icon: ShoppingBag,     path: "/store" },
];

const Sidebar = () => {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { logout }     = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0"
      style={{ backgroundColor: "#3d4467" }}
    >
      {/* ── Brand ── */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "#4e5580" }}>
        <p className="text-white font-extrabold text-base leading-tight">StyleMate</p>
        <p className="text-xs mt-0.5" style={{ color: "#9ba3c4" }}>Personal Stylist</p>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? "#4e5580" : "transparent",
                color:           active ? "#ffffff" : "#9ba3c4",
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom: Profile + Logout ── */}
      <div
        className="px-3 pb-6 space-y-1 border-t pt-4"
        style={{ borderColor: "#4e5580" }}
      >
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ color: "#9ba3c4" }}
        >
          <User size={17} />
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:text-red-400"
          style={{ color: "#9ba3c4" }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div
            className="rounded-2xl p-6 w-80 shadow-xl"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EDEBFA" }}
              >
                <LogOut size={18} style={{ color: "#4a5280" }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: "#1c1c2e" }}>
                Confirm Logout
              </h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "#7C8197" }}>
              Are you sure you want to logout? You will need to sign in again to access your wardrobe.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: "#ede8e0", color: "#374151", backgroundColor: "#faf8f5" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#4a5280" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
