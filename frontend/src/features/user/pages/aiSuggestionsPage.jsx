import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, History, RefreshCw, User, ChevronDown, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/sidebar";
import AddToPlannerModal from "../components/addToPlan";
import AiSuggestionCard from "../components/aiSuggestionCard";
import useAiSuggestions from "../hooks/useAiSuggestions";
import usePlanner from "../hooks/usePlanner";

const OCCASIONS = [
  "Casual", "Formal", "Office", "College", "Wedding",
  "Party", "Traditional", "Travel", "Sports",
];

const SEASONS = ["Any", "Summer", "Winter", "Spring", "Autumn", "Monsoon"];

const COLOR_OPTIONS = [
  "White", "Black", "Blue", "Grey", "Cream", "Brown",
  "Navy", "Beige", "Maroon", "Neutral", "Pastel",
];

const CATEGORY_OPTIONS = ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200"
    style={{
      backgroundColor: active ? "#D7D8F6" : "#FFFFFF",
      color: active ? "#2F3447" : "#7C8197",
      borderColor: active ? "#D7D8F6" : "#E5E7EB",
    }}
  >
    {label}
  </button>
);

const AiSuggestionsPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    generateSuggestions,
    regenerateSuggestions,
    saveSuggestedOutfit,
    toggleSuggestionFavorite,
  } = useAiSuggestions();
  const { savePlan } = usePlanner();

  const [occasion, setOccasion] = useState("Casual");
  const [season, setSeason] = useState("Any");
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [batch, setBatch] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const [plannerOutfit, setPlannerOutfit] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const toggleFromList = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleGenerate = async () => {
    const result = await generateSuggestions({
      occasion,
      season: season === "Any" ? undefined : season,
      preferredColors: selectedColors,
      categories: selectedCategories,
    });
    if (result.success) {
      setBatch(result.suggestion);
    } else {
      toast.error(result.message);
    }
  };

  const handleRegenerate = async () => {
    if (!batch) return;
    setRegenerating(true);
    const result = await regenerateSuggestions(batch._id);
    setRegenerating(false);
    if (result.success) {
      setBatch(result.suggestion);
      toast.success("Fresh suggestions ready");
    } else {
      toast.error(result.message);
    }
  };

  const updateEntry = (index, patch) => {
    setBatch((prev) => {
      if (!prev) return prev;
      const suggestions = prev.suggestions.map((s, i) => (i === index ? { ...s, ...patch } : s));
      return { ...prev, suggestions };
    });
  };

  const handleSaveEntry = async (index) => {
    const result = await saveSuggestedOutfit(batch._id, index);
    if (result.success) {
      updateEntry(index, { savedAsOutfit: result.outfit._id });
      toast.success("Outfit saved to My Outfits");
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleToggleFavoriteEntry = async (index) => {
    const result = await toggleSuggestionFavorite(batch._id, index);
    if (result.success) {
      updateEntry(index, { savedAsOutfit: result.outfit._id, isFavorite: result.outfit.isFavorite });
      toast.success(result.outfit.isFavorite ? "Added to favorites" : "Removed from favorites");
    } else {
      toast.error(result.message);
    }
  };

  const handleOpenPlanner = async (index) => {
    const entry = batch.suggestions[index];
    let outfit = null;

    if (entry.savedAsOutfit) {
      outfit = { _id: entry.savedAsOutfit, name: entry.label || "AI Outfit", occasion, items: entry.items };
    } else {
      const result = await handleSaveEntry(index);
      if (!result.success) return;
      outfit = result.outfit;
    }
    setPlannerOutfit(outfit);
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
            <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
              AI Outfit Suggestions
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ai-suggestions/history")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: "1px solid #E5E7EB", color: "#52557A" }}
            >
              <History size={16} />
              History
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
          <div
            className="bg-white rounded-[20px] p-6 mb-6"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(47,52,71,0.06)" }}
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "#7C8197" }}>
                  WHERE ARE YOU GOING?
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-white font-medium"
                  style={{ border: "1px solid #E5E7EB", color: "#2F3447" }}
                >
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[140px]">
                <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "#7C8197" }}>
                  SEASON
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-white font-medium"
                  style={{ border: "1px solid #E5E7EB", color: "#2F3447" }}
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: "#4a5280", boxShadow: "0 4px 14px rgba(74,82,128,0.28)" }}
              >
                <Sparkles size={16} />
                {isLoading ? "Styling your look..." : "Get Suggestions"}
              </button>
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium mt-4"
              style={{ color: "#7C8197" }}
            >
              <ChevronDown size={14} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              {showFilters ? "Hide optional preferences" : "Preferred colors & categories (optional)"}
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide mb-2" style={{ color: "#7C8197" }}>
                        PREFERRED COLORS
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((c) => (
                          <Chip
                            key={c}
                            label={c}
                            active={selectedColors.includes(c)}
                            onClick={() => toggleFromList(selectedColors, setSelectedColors, c)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide mb-2" style={{ color: "#7C8197" }}>
                        LIMIT TO CATEGORIES
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_OPTIONS.map((c) => (
                          <Chip
                            key={c}
                            label={c}
                            active={selectedCategories.includes(c)}
                            onClick={() => toggleFromList(selectedCategories, setSelectedCategories, c)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {batch && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#2F3447" }}>
                Curated for your day
              </h2>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                style={{ border: "1px solid #E5E7EB", color: "#52557A" }}
              >
                <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                {regenerating ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          )}

          {!batch && !isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#D7D8F6" }}>
                <Sparkles size={22} style={{ color: "#52557A" }} />
              </div>
              <p className="font-semibold" style={{ color: "#2F3447" }}>No suggestions yet</p>
              <p className="text-sm max-w-xs" style={{ color: "#7C8197" }}>
                Pick where you are headed and let AI style a look from your own wardrobe.
              </p>
            </div>
          )}

          {batch && (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {batch.suggestions.map((entry, index) => (
                <AiSuggestionCard
                  key={entry._id || index}
                  entry={entry}
                  batchId={batch._id}
                  index={index}
                  onSave={handleSaveEntry}
                  onToggleFavorite={handleToggleFavoriteEntry}
                  onAddToPlanner={handleOpenPlanner}
                />
              ))}
            </motion.div>
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

export default AiSuggestionsPage;