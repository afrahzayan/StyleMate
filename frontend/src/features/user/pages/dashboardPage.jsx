import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Shirt,
  Layers,
  Heart,
  Plus,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Clock,
  ImageOff,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import useDashboard from "../hooks/useDashboard";

const outfitThumb = (outfit) => outfit?.items?.find((i) => i?.image?.url)?.image?.url || null;

const formatPlanDate = (isoDate) => {
  const d = new Date(isoDate);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
};

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

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <header
          className="flex items-center justify-between px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
              Dashboard
            </h1>
          </div>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "#4a5280" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-7 py-6">

          <div className="mb-6">
            <h2 className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>
              Hello, {user?.name?.split(" ")[0] || "there"}!
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Ready to find your perfect look today?
            </p>
          </div>

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

          <div className="flex gap-5">

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
                      className="w-full h-36 rounded-lg overflow-hidden bg-cover bg-center"
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

            <div
              className="w-64 shrink-0 rounded-xl p-5 flex flex-col"
              style={{ backgroundColor: "#4a5280" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#5e6a9a" }}
                  >
                    <CalendarDays size={17} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">Upcoming Planned Outfits</p>
                </div>
              </div>

              {isLoading ? (
                <p className="text-xs" style={{ color: "#b0b8d8" }}>Loading...</p>
              ) : (dashboard?.upcomingPlans || []).length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-6">
                  <p className="text-xs leading-relaxed" style={{ color: "#b0b8d8" }}>
                    No upcoming planned outfits.
                  </p>
                </div>
              ) : (
                <div className="flex-1 space-y-2.5">
                  {dashboard.upcomingPlans.map((plan) => {
                    const thumb = outfitThumb(plan.outfit);
                    const { date, weekday, time } = formatPlanDate(plan.date);
                    return (
                      <button
                        key={plan._id}
                        onClick={() => navigate("/planner")}
                        className="w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/10"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: "#5e6a9a" }}
                        >
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff size={14} className="text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs font-bold truncate">
                            {plan.outfit?.name || "Deleted outfit"}
                          </p>
                          <p className="text-[11px] flex items-center gap-1" style={{ color: "#b0b8d8" }}>
                            {date} · {weekday}
                          </p>
                          <p className="text-[10px] flex items-center gap-1" style={{ color: "#9aa2c8" }}>
                            <Clock size={9} /> {time}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => navigate("/planner")}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-gray-50 transition-colors"
                style={{ color: "#4a5280" }}
              >
                Open Planner
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;