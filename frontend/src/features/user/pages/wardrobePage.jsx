import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Heart, ImageOff } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import useWardrobe from "../hooks/useWardrobe";

const CATEGORY_TABS = ["All", "Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];

// Display labels differ slightly from the stored enum values (plural, nicer wording)
const TAB_LABELS = {
  All: "All",
  Top: "Tops",
  Bottom: "Bottoms",
  Dress: "Dresses",
  Hijab: "Hijabs",
  "Foot Wears": "Foot Wears",
  Bags: "Bags",
  Accessories: "Accessories",
};

const WardrobePage = () => {
  const navigate = useNavigate();
  const { isLoading, fetchCloths, toggleFavorite } = useWardrobe();

  const [cloths, setCloths] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const loadCloths = async (category) => {
    const result = await fetchCloths({ category });
    if (result.success) {
      setCloths(result.cloths);
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    loadCloths(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const visibleCloths = useMemo(() => {
    if (!search.trim()) return cloths;
    const q = search.trim().toLowerCase();
    return cloths.filter((c) => c.name?.toLowerCase().includes(q));
  }, [cloths, search]);

  const prevIdsRef = useRef([]);
  const shuffledMapRef = useRef(new Map());

  const shuffledCloths = useMemo(() => {
    const ids = visibleCloths.map((c) => c._id);
    const idsKey = ids.join(",");

    // Only reshuffle when the set of IDs changes (add/remove), not on property changes
    if (prevIdsRef.current !== idsKey) {
      prevIdsRef.current = idsKey;
      shuffledMapRef.current.clear();
      const indices = [...ids.keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      indices.forEach((shuffledIdx, displayIdx) => {
        shuffledMapRef.current.set(ids[shuffledIdx], displayIdx);
      });
    }

    return [...visibleCloths].sort(
      (a, b) => (shuffledMapRef.current.get(a._id) ?? 0) - (shuffledMapRef.current.get(b._id) ?? 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCloths]);

  const handleToggleFavorite = async (e, id) => {
    e.stopPropagation(); // don't trigger the card's navigate-to-detail click
    const result = await toggleFavorite(id);
    if (result.success) {
      setCloths((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isFavorite: result.cloth.isFavorite } : c))
      );
    } else {
      toast.error(result.message);
    }
  };

  // Small subtitle line under each item's name, e.g. "Top • White • Summer"
  const subtitleFor = (cloth) => {
    const parts = [cloth.category, cloth.color?.primary, cloth.season].filter(Boolean);
    return parts.join(" • ");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top bar ── */}
        <header
          className="flex items-center justify-between gap-4 px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <h1 className="font-extrabold text-base shrink-0" style={{ color: "#1c1c2e" }}>
            My Wardrobe
          </h1>

          <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
            <div
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search clothes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
            <button
              onClick={() => navigate("/wardrobe/add")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 shrink-0"
              style={{ backgroundColor: "#4a5280" }}
            >
              <Plus size={15} />
              Add New
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="flex-1 overflow-y-auto px-7 py-6">

          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor: active ? "#4a5280" : "transparent",
                    color: active ? "#ffffff" : "#374151",
                    borderColor: active ? "#4a5280" : "#e5e7eb",
                  }}
                >
                  {TAB_LABELS[tab]}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoading && cloths.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-16 text-sm text-gray-400">
                Loading wardrobe...
              </div>
            ) : (
              shuffledCloths.map((cloth) => (
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
                      onClick={(e) => handleToggleFavorite(e, cloth._id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                    >
                      <Heart
                        size={15}
                        fill={cloth.isFavorite ? "#4a5280" : "none"}
                        style={{ color: "#4a5280" }}
                      />
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-bold" style={{ color: "#1c1c2e" }}>
                    {cloth.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{subtitleFor(cloth)}</p>
                </div>
              ))
            )}

            {!isLoading && visibleCloths.length === 0 && cloths.length > 0 && (
              <div className="col-span-full text-center py-10 text-sm text-gray-400">
                No items match "{search}"
              </div>
            )}

            {!isLoading && cloths.length === 0 && (
              <div className="col-span-full text-center py-16 text-sm text-gray-400">
                No items in this category yet. Use "Add New Clothes" above to get started.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WardrobePage;