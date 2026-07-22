import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutGrid,
  Users,
  Shirt,
  BarChart2,
  Bot,
  UserCircle,
  LogOut,
} from "lucide-react";
import useAuth from "../../auth/hooks/useAuth";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, path: "/admin", enabled: true },
  { label: "Users",     icon: Users,      path: "/admin/users", enabled: true },
  { label: "Clothes",   icon: Shirt,      path: "/admin/clothes", enabled: false },
  { label: "Reports",   icon: BarChart2,  path: "/admin/reports", enabled: false },
  { label: "AI Usage",  icon: Bot,        path: "/admin/ai-usage", enabled: false },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNavClick = (item) => {
    if (!item.enabled) {
      toast("Coming soon", { icon: "🛠️" });
      return;
    }
    navigate(item.path);
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
        style={{ backgroundColor: "#2d3358" }}
      >
        <div className="px-6 py-6 border-b" style={{ borderColor: "#3d4470" }}>
          <p className="text-white font-extrabold text-lg leading-tight">StyleMate</p>
          <p className="text-xs tracking-widest mt-0.5" style={{ color: "#9ba3c4" }}>
            ADMIN PANEL
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "#3d4470" : "transparent",
                  color: active ? "#ffffff" : "#9ba3c4",
                  opacity: item.enabled ? 1 : 0.6,
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-1 border-t pt-4" style={{ borderColor: "#3d4470" }}>
          <button
            onClick={() => toast("Coming soon", { icon: "🛠️" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "#9ba3c4", opacity: 0.6 }}
          >
            <UserCircle size={17} />
            Profile
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:text-red-400"
            style={{ color: "#9ba3c4" }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="rounded-2xl p-6 w-80 shadow-xl" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EDEBFA" }}
              >
                <LogOut size={18} style={{ color: "#2d3358" }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: "#1c1c2e" }}>
                Confirm Logout
              </h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "#7C8197" }}>
              Are you sure you want to logout of the admin panel?
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
                style={{ backgroundColor: "#2d3358" }}
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

export default AdminSidebar;