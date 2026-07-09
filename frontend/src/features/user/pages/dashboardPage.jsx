import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Shirt,
  Layers,
  Heart,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import useDashboard from "../hooks/useDashboard";

const STAT_ITEMS = [
  { label: "CLOTHES",       key: "totalClothes",      icon: Shirt },
  { label: "TOTAL OUTFITS", key: "outfitCount",       icon: Layers },
  { label: "FAVORITES",     key: "favoriteClothesCount", icon: Heart },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: dashboard, isLoading } = useDashboard();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
            Dashboard
          </h1>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "#4a5280" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </button>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-7 py-6">

          {/* ── Greeting row ── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>
                Hello, {user?.name?.split(" ")[0] || "there"}!
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Ready to find your perfect look today?
              </p>
            </div>
            <button
              onClick={() => navigate("/wardrobe/add")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: "#4a5280" }}
            >
              <Plus size={15} />
              Add New Clothes
            </button>
          </div>

          {/* ── Stats cards ── */}
          <div className="grid grid-cols-3 gap-4 mb-7">
            {STAT_ITEMS.map(({ label, key, icon: Icon }) => {
              const value = isLoading ? "—" : dashboard?.[key] ?? 0;
              return (
                <div
                  key={label}
                  className="bg-white rounded-xl p-4 border"
                  style={{ borderColor: "#ede8e0" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 tracking-wide">{label}</p>
                    <Icon size={16} style={{ color: "#4a5280" }} />
                  </div>
                  <p className="text-2xl font-extrabold mb-0.5" style={{ color: "#1c1c2e" }}>{value}</p>
                </div>
              );
            })}
          </div>

          {/* ── Bottom row: Recent clothes + AI card ── */}
          <div className="flex gap-5">

            {/* Left: Recently Added Clothes */}
            <div
              className="flex-1 bg-white rounded-xl p-5 border"
              style={{ borderColor: "#ede8e0" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "#1c1c2e" }}>
                    Recently Added Clothes
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Latest additions to your digital wardrobe.</p>
                </div>
                <button
                  onClick={() => navigate("/wardrobe")}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "#4a5280" }}
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(dashboard?.recentClothes || []).slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/wardrobe/${item._id}`)}
                    className="rounded-xl border p-3 flex flex-col items-center gap-2 hover:border-gray-300 transition-colors cursor-pointer"
                    style={{ borderColor: "#ede8e0" }}
                  >
                    <div
                      className="w-full h-20 rounded-lg overflow-hidden bg-cover bg-center"
                      style={{
                        backgroundColor: "#f0f2fa",
                        backgroundImage: item.image?.url ? `url(${item.image.url})` : undefined,
                      }}
                    >
                      {!item.image?.url && (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold" style={{ color: "#1c1c2e" }}>{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                  </div>
                ))}

                {/* Add more card */}
                <button
                  onClick={() => navigate("/wardrobe/add")}
                  className="rounded-xl border-2 border-dashed p-3 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 transition-colors"
                  style={{ borderColor: "#d1d5db", minHeight: "120px" }}
                >
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-xs font-medium">Add More</span>
                </button>
              </div>
            </div>

            {/* Right: AI Suggestion card */}
            <div
              className="w-52 shrink-0 rounded-xl p-5 flex flex-col justify-between"
              style={{ backgroundColor: "#4a5280" }}
            >
              <div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#5e6a9a" }}
                >
                  <Sparkles size={18} className="text-white" />
                </div>
                <p className="text-white font-bold text-sm mb-1">AI Suggestions</p>
                <p className="text-xs leading-relaxed" style={{ color: "#b0b8d8" }}>
                  Get outfit ideas tailored to your style and today&apos;s occasion.
                </p>
              </div>
              <button
                onClick={() => navigate("/ai-suggestions")}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-gray-50 transition-colors"
                style={{ color: "#4a5280" }}
              >
                Get Suggestions
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
