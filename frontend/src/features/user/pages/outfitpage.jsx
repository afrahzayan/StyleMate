import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, User, Sparkles, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/sidebar";
import OutfitCard from "../components/outfit/outfitCard";
import FilterPills from "../components/outfit/filterPills";
import SortMenu from "../components/outfit/sortMenu";
import useOutfits from "../hooks/useOtfits";

const FILTERS = [
  { label: "All Seasons", value: "All" },
  { label: "Casual", value: "Casual" },
  { label: "Work", value: "Work" },
  { label: "Office", value: "Office" },
  { label: "College", value: "College" },
  { label: "Formal", value: "Formal" },
  { label: "Party", value: "Party" },
  { label: "Wedding", value: "Wedding" },
  { label: "Traditional", value: "Traditional" },
  { label: "Travel", value: "Travel" },
  { label: "Sports", value: "Sports" },
  { label: "Eid", value: "Eid" },
  { label: "Other", value: "Other" },
];

const SORT_OPTIONS = [
  { label: "Recently Modified", value: "recent" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A–Z", value: "name" },
];

const OutfitsPage = () => {
  const navigate = useNavigate();
  const { isLoading, fetchOutfits, toggleFavorite, deleteOutfit } = useOutfits();

  const [outfits, setOutfits] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sort, setSort] = useState("recent");

  const loadOutfits = async () => {
    const result = await fetchOutfits({ occasion: activeFilter, sort });
    if (result.success) {
      setOutfits(result.outfits);
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, [activeFilter, sort]);

  const handleToggleFavorite = async (e, id) => {
    const result = await toggleFavorite(id);
    if (result.success) {
      setOutfits((prev) =>
        prev.map((o) => (o._id === id ? { ...o, isFavorite: result.outfit.isFavorite } : o))
      );
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to remove this outfit?");
    if (!confirmed) return;
    const result = await deleteOutfit(id);
    if (result.success) {
      setOutfits((prev) => prev.filter((o) => o._id !== id));
      toast.success("Outfit removed");
    } else {
      toast.error(result.message);
    }
  };

  const handleCardClick = (outfit) => (e, opts) => {
    navigate(`/outfits/${outfit._id}/edit`);
  };

  const collectionsLabel = useMemo(() => {
    if (isLoading && outfits.length === 0) return "";
    return `${outfits.length} Saved Collection${outfits.length === 1 ? "" : "s"}`;
  }, [outfits.length, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between gap-4 px-8 py-5 bg-white border-b shrink-0"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
                My Outfits
              </h1>
              <span className="text-sm" style={{ color: "#7C8197" }}>
                {collectionsLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/outfits/new")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#52557A", boxShadow: "0 4px 14px rgba(82,85,122,0.28)" }}
            >
              <Plus size={16} />
              Create New
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#FAF8F2", border: "1px solid #E5E7EB" }}
              aria-label="Profile"
            >
              <User size={18} style={{ color: "#52557A" }} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <FilterPills options={FILTERS} active={activeFilter} onChange={setActiveFilter} />
            <SortMenu options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </div>

          {isLoading && outfits.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm" style={{ color: "#7C8197" }}>
              Loading your outfits...
            </div>
          ) : outfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#D7D8F6" }}
              >
                <Sparkles size={22} style={{ color: "#52557A" }} />
              </div>
              <p className="font-semibold" style={{ color: "#2F3447" }}>
                No outfits here yet
              </p>
              <p className="text-sm max-w-xs" style={{ color: "#7C8197" }}>
                Build your first look from items already in your wardrobe.
              </p>
              <button
                onClick={() => navigate("/outfits/new")}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#52557A" }}
              >
                <Plus size={16} />
                Create New Outfit
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit._id}
                    outfit={outfit}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={handleCardClick(outfit)}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OutfitsPage;