import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  Layers,
  CalendarDays,
  Heart,
  History,
  Sparkles,
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
  { label: "History",        icon: History,         path: "/history" },
  { label: "AI Suggestions", icon: Sparkles,        path: "/ai-suggestions" },
];

const Sidebar = () => {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { logout }     = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
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
  );
};

export default Sidebar;
