import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, User, Heart, Sparkles, CalendarCheck, ImageOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/sidebar";
import FilterPills from "../components/outfit/filterPills";
import SortMenu from "../components/outfit/sortMenu";
import FavoriteOutfitCard from "../components/outfit/favOutfitCard";
import AddToPlannerModal from "../components/addToPlan";
import useOutfits from "../hooks/useOutfits";
import useWardrobe from "../hooks/useWardrobe";
import usePlanner from "../hooks/usePlanner";

const FILTERS = [
  { label: "All", value: "All" },
  { label: "Casual", value: "Casual" },
  { label: "Formal", value: "Formal" },
  { label: "Party", value: "Party" },
  { label: "Work", value: "Work" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "recent" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A–Z", value: "name" },
];

const useDebouncedValue = (value, delayMs) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
};

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, fetchOutfits, fetchFavoriteStats, toggleFavorite } = useOutfits();
  const { fetchCloths: fetchFavoriteCloths, toggleFavorite: toggleClothFavorite } = useWardrobe();
  const { savePlan } = usePlanner();

  const [favorites, setFavorites] = useState([]);
  const [favoriteCloths, setFavoriteCloths] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [plannerOutfit, setPlannerOutfit] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const loadFavorites = useCallback(async () => {
    const result = await fetchOutfits({ favorite: true, occasion: activeFilter, sort, search: debouncedSearch });
    if (result.success) {
      setFavorites(result.outfits);
    } else {
      toast.error(result.message);
    }
  }, [activeFilter, sort, debouncedSearch]);

  const loadStats = useCallback(async () => {
    const result = await fetchFavoriteStats();
    if (result.success) setStats(result.stats);
  }, []);

  const loadFavoriteCloths = useCallback(async () => {
    const result = await fetchFavoriteCloths({ favorite: true });
    if (result.success) {
      setFavoriteCloths(result.cloths);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadFavoriteCloths();
  }, [loadFavoriteCloths]);

  const handleToggleFavorite = async (e, id) => {
    const result = await toggleFavorite(id);
    if (result.success) {
      setFavorites((prev) => prev.filter((o) => o._id !== id));
      loadStats();
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleClothFavorite = async (e, id) => {
    e.stopPropagation();
    const result = await toggleClothFavorite(id);
    if (result.success) {
      setFavoriteCloths((prev) => prev.filter((c) => c._id !== id));
    } else {
      toast.error(result.message);
    }
  };

  const handleSavePlan = async (payload) => {
    setIsSavingPlan(true);
    const result = await savePlan(payload);
    setIsSavingPlan(false);
    if (result.success) {
      toast.success("Added to your planner");
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const subtitle = useMemo(() => "Your saved outfit combinations", []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between gap-4 px-8 py-5 bg-white border-b shrink-0 flex-wrap"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
                Favorites
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "#7C8197" }}>{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by outfit or occasion..."
                className="pl-9 pr-4 py-2.5 rounded-full border text-sm outline-none w-72"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#FAF8F2" }}
              />
            </div>
            <SortMenu options={SORT_OPTIONS} value={sort} onChange={setSort} />
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#4a5280" }}
              aria-label="Profile"
            >
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border flex items-center gap-3" style={{ borderColor: "#ede8e0" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EDEBFA" }}>
                <Heart size={17} fill="#52557A" style={{ color: "#52557A" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide" style={{ color: "#9CA3AF" }}>SAVED OUTFITS</p>
                <p className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>{stats ? stats.savedOutfits : "—"}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border flex items-center gap-3" style={{ borderColor: "#ede8e0" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EDEBFA" }}>
                <Sparkles size={17} style={{ color: "#52557A" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide" style={{ color: "#9CA3AF" }}>TOTAL TIMES WORN</p>
                <p className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>{stats ? stats.totalTimesWorn : "—"}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border flex items-center gap-3" style={{ borderColor: "#ede8e0" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EDEBFA" }}>
                <CalendarCheck size={17} style={{ color: "#52557A" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide" style={{ color: "#9CA3AF" }}>TOP OCCASION</p>
                <p className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>{stats?.topOccasion || "—"}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <FilterPills options={FILTERS} active={activeFilter} onChange={setActiveFilter} />
          </div>

          {isLoading && favorites.length === 0 && favoriteCloths.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm" style={{ color: "#7C8197" }}>
              Loading your favorites...
            </div>
          ) : favorites.length === 0 && favoriteCloths.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EDEBFA" }}>
                <Heart size={22} style={{ color: "#9CA3AF" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#2F3447" }}>
                {search || activeFilter !== "All" ? "No favorites match your filters" : "No favorites yet"}
              </p>
              <p className="text-xs max-w-xs" style={{ color: "#7C8197" }}>
                {search || activeFilter !== "All"
                  ? "Try a different search term or occasion."
                  : "Tap the heart on any outfit or item to save it here."}
              </p>
            </div>
          ) : (
            <>
              {favoriteCloths.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold mb-4" style={{ color: "#2F3447" }}>Favorite Items</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {favoriteCloths.map((cloth) => (
                      <div
                        key={cloth._id}
                        onClick={() => navigate(`/wardrobe/${cloth._id}`)}
                        className="rounded-2xl border bg-white p-3 cursor-pointer hover:shadow-sm transition-shadow"
                        style={{ borderColor: "#ede8e0" }}
                      >
                        <div className="relative">
                          <div
                            className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: "#f5f2ec" }}
                          >
                            {cloth.image?.url ? (
                              <img
                                src={cloth.image.url}
                                alt={cloth.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageOff size={28} className="text-gray-300" />
                            )}
                          </div>
                          <button
                            onClick={(e) => handleToggleClothFavorite(e, cloth._id)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                          >
                            <Heart size={15} fill="#4a5280" style={{ color: "#4a5280" }} />
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-bold" style={{ color: "#1c1c2e" }}>
                          {cloth.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[cloth.category, cloth.color?.primary, cloth.season].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold mb-4" style={{ color: "#2F3447" }}>Favorite Outfits</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {favorites.map((outfit) => (
                      <FavoriteOutfitCard
                        key={outfit._id}
                        outfit={outfit}
                        onToggleFavorite={handleToggleFavorite}
                        onAddToPlanner={setPlannerOutfit}
                        onClick={() => navigate(`/outfits/${outfit._id}/edit`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {plannerOutfit && (
        <AddToPlannerModal
          outfit={plannerOutfit}
          isSaving={isSavingPlan}
          onClose={() => setPlannerOutfit(null)}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
};

export default FavoritesPage;