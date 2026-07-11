import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, GripVertical, Save, Trash2, ImageOff } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/sidebar";
import useWardrobe from "../hooks/useWardrobe";
import useOutfits from "../hooks/useOtfits";

// Maps the reference design's tabs onto the real Cloth `category` enum.
// Nothing here changes the schema — it's purely how the builder groups
// existing categories for browsing. Hijab and Bags get their own tabs
// (rather than being folded into "Accs") so each category can be filtered
// independently.
const TABS = [
  { key: "Top", label: "Top", categories: ["Top", "Dress"] },
  { key: "Bottom", label: "Bottom", categories: ["Bottom"] },
  { key: "Foot Wears", label: "Foot Wears", categories: ["Foot Wears"] },
  { key: "Hijab", label: "Hijab", categories: ["Hijab"] },
  { key: "Bags", label: "Bags", categories: ["Bags"] },
  { key: "Accs", label: "Accessories", categories: ["Accessories"] },
];

// Order items appear in the vertical canvas, top-to-bottom.
const CATEGORY_ORDER = ["Top", "Dress", "Bottom", "Foot Wears", "Hijab", "Bags", "Accessories"];

const OCCASIONS = ["Casual", "Formal", "Party", "Work", "Wedding", "Eid", "Other"];

const OutfitBuilderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // present only when editing an existing outfit
  const isEditMode = Boolean(id);

  const { isLoading: wardrobeLoading, fetchCloths } = useWardrobe();
  const { isLoading: savingOutfit, createOutfit, updateOutfit, fetchOutfitById } = useOutfits();

  const [allCloths, setAllCloths] = useState([]);
  const [activeTab, setActiveTab] = useState("Top");
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState([]); // ordered array of Cloth _id
  const [selectedMap, setSelectedMap] = useState({}); // _id -> cloth object (for canvas render without refetch)

  const [outfitName, setOutfitName] = useState("");
  const [occasion, setOccasion] = useState("Casual");

  // ── Load wardrobe items once ──────────────────────────────────
  useEffect(() => {
    (async () => {
      const result = await fetchCloths({ category: "All" });
      if (result.success) setAllCloths(result.cloths);
      else toast.error(result.message);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── If editing, preload the existing outfit ──────────────────
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      const result = await fetchOutfitById(id);
      if (result.success) {
        const outfit = result.outfit;
        setOutfitName(outfit.name);
        setOccasion(outfit.occasion || "Casual");
        setSelectedIds(outfit.items.map((it) => it._id));
        setSelectedMap(Object.fromEntries(outfit.items.map((it) => [it._id, it])));
      } else {
        toast.error(result.message);
        navigate("/outfits");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const activeCategories = TABS.find((t) => t.key === activeTab)?.categories || [];

  const visibleItems = useMemo(() => {
    let items = allCloths.filter((c) => activeCategories.includes(c.category));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((c) => c.name?.toLowerCase().includes(q));
    }
    return items;
  }, [allCloths, activeCategories, search]);

  // ── Canvas items, grouped visually top -> bottom ─────────────
  const canvasItems = useMemo(() => {
    return selectedIds
      .map((cid) => selectedMap[cid])
      .filter(Boolean)
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  }, [selectedIds, selectedMap]);

  const toggleItem = (cloth) => {
    setSelectedIds((prev) => {
      if (prev.includes(cloth._id)) return prev.filter((cid) => cid !== cloth._id);
      return [...prev, cloth._id];
    });
    setSelectedMap((prev) => ({ ...prev, [cloth._id]: cloth }));
  };

  const removeFromCanvas = (clothId) => {
    setSelectedIds((prev) => prev.filter((cid) => cid !== clothId));
  };

  const clearCanvas = () => {
    setSelectedIds([]);
    setSelectedMap({});
  };

  const handleSave = async () => {
    if (!outfitName.trim()) {
      toast.error("Give this outfit a name first");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Add at least one item to the canvas");
      return;
    }

    const payload = { name: outfitName.trim(), occasion, items: selectedIds };
    const result = isEditMode
      ? await updateOutfit(id, payload)
      : await createOutfit({ ...payload, source: "manual" });

    if (result.success) {
      toast.success(isEditMode ? "Outfit updated" : "Outfit saved");
      navigate("/outfits");
    } else {
      toast.error(result.message);
    }
  };

  const subtitleFor = (cloth) => [cloth.brand, cloth.subCategory].filter(Boolean).join(" · ");

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <header
          className="flex items-center justify-between gap-4 px-8 py-5 bg-white border-b shrink-0"
          style={{ borderColor: "#E5E7EB" }}
        >
          <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
            {isEditMode ? "Edit Outfit" : "Build Your Outfit"}
          </h1>

          <div
            className="flex items-center gap-2 w-72 px-3 py-2 rounded-xl"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <Search size={15} style={{ color: "#7C8197" }} />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
              style={{ color: "#2F3447" }}
            />
          </div>
        </header>

        {/* ── Body: two panels ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel — wardrobe browser */}
          <div className="w-[420px] shrink-0 border-r overflow-y-auto px-6 py-5" style={{ borderColor: "#E5E7EB" }}>
            <div className="flex flex-wrap gap-2 mb-5">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200"
                    style={{
                      backgroundColor: active ? "#D7D8F6" : "#FFFFFF",
                      color: active ? "#2F3447" : "#7C8197",
                      borderColor: active ? "#D7D8F6" : "#E5E7EB",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {wardrobeLoading && allCloths.length === 0 ? (
              <div className="py-16 text-center text-sm" style={{ color: "#7C8197" }}>
                Loading wardrobe...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {visibleItems.map((cloth) => {
                  const active = selectedIds.includes(cloth._id);
                  return (
                    <motion.button
                      key={cloth._id}
                      onClick={() => toggleItem(cloth)}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="text-left rounded-2xl overflow-hidden bg-white p-2.5"
                      style={{
                        border: active ? "2px solid #52557A" : "1px solid #E5E7EB",
                        boxShadow: active ? "0 4px 14px rgba(82,85,122,0.18)" : "0 1px 3px rgba(47,52,71,0.04)",
                      }}
                    >
                      <div
                        className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: "#F5F4FA" }}
                      >
                        {cloth.image?.url ? (
                          <img src={cloth.image.url} alt={cloth.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff size={22} style={{ color: "#C7C9DC" }} />
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold truncate" style={{ color: "#2F3447" }}>
                        {cloth.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#7C8197" }}>
                        {subtitleFor(cloth) || "—"}
                      </p>
                    </motion.button>
                  );
                })}

                {!wardrobeLoading && visibleItems.length === 0 && (
                  <div className="col-span-2 py-16 text-center text-sm" style={{ color: "#7C8197" }}>
                    No items in this category yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel — outfit canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <p className="text-xs font-semibold tracking-wide mb-4" style={{ color: "#7C8197" }}>
                YOUR OUTFIT CANVAS
              </p>

              <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                <AnimatePresence>
                  {canvasItems.map((cloth) => (
                    <motion.div
                      key={cloth._id}
                      layout
                      initial={{ opacity: 0, y: -12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                      className="relative w-full rounded-2xl bg-white p-2"
                      style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 10px rgba(47,52,71,0.06)" }}
                    >
                      <button
                        onClick={() => removeFromCanvas(cloth._id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center z-10"
                        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 6px rgba(47,52,71,0.14)" }}
                        aria-label="Remove item"
                      >
                        <X size={12} style={{ color: "#52557A" }} />
                      </button>
                      <div className="absolute top-1/2 -left-6 -translate-y-1/2 hidden md:block">
                        <GripVertical size={16} style={{ color: "#D7D8F6" }} />
                      </div>
                      <div className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: "4 / 3", backgroundColor: "#F5F4FA" }}>
                        {cloth.image?.url ? (
                          <img src={cloth.image.url} alt={cloth.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff size={20} style={{ color: "#C7C9DC" }} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {canvasItems.length === 0 && (
                  <div
                    className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-16 text-center"
                    style={{ border: "2px dashed #E5E7EB" }}
                  >
                    <p className="text-sm font-medium" style={{ color: "#7C8197" }}>
                      Tap items on the left to add them here
                    </p>
                  </div>
                )}

                {/* Add-more placeholder slots, purely visual affordance */}
                {canvasItems.length > 0 && (
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ border: "1.5px dashed #D7D8F6", color: "#B7B9E0" }}
                    >
                      +
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ border: "1.5px dashed #D7D8F6", color: "#B7B9E0" }}
                    >
                      +
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom action bar ── */}
            <div
              className="flex items-center gap-3 px-8 py-4 border-t bg-white shrink-0 flex-wrap"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                <label className="text-xs font-medium" style={{ color: "#7C8197" }}>
                  Outfit Name
                </label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g. College Look"
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: "1px solid #E5E7EB", color: "#2F3447" }}
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-xs font-medium" style={{ color: "#7C8197" }}>
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none bg-white"
                  style={{ border: "1px solid #E5E7EB", color: "#2F3447" }}
                >
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearCanvas}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: "1px solid #E5E7EB", color: "#7C8197" }}
              >
                <Trash2 size={14} />
                Clear Canvas
              </button>

              <button
                onClick={handleSave}
                disabled={savingOutfit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: "#52557A", boxShadow: "0 4px 14px rgba(82,85,122,0.28)" }}
              >
                <Save size={15} />
                {savingOutfit ? "Saving..." : "Save Outfit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitBuilderPage;