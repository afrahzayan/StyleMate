import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Trash2, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/sidebar";
import AddToPlannerModal from "../components/addToPlan";
import AiSuggestionCard from "../components/aiSuggestionCard";
import useAiSuggestions from "../hooks/useAiSuggestions";
import usePlanner from "../hooks/usePlanner";

const STATUS_STYLES = {
  success: { backgroundColor: "#E6F4EA", color: "#1E7E34" },
  partial: { backgroundColor: "#FFF4E0", color: "#B7791F" },
  failed: { backgroundColor: "#FDECEC", color: "#C0392B" },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const AiSuggestionHistoryPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    fetchHistory,
    saveSuggestedOutfit,
    toggleSuggestionFavorite,
    deleteSuggestion,
  } = useAiSuggestions();
  const { savePlan } = usePlanner();

  const [batches, setBatches] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const [plannerOutfit, setPlannerOutfit] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const load = async (targetPage = 1, append = false) => {
    const result = await fetchHistory({ page: targetPage, limit: 10 });
    if (result.success) {
      setBatches((prev) => (append ? [...prev, ...result.batches] : result.batches));
      setPage(targetPage);
      setPages(result.pages);
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    load(1, false);
  }, []);

  const updateEntry = (batchId, index, patch) => {
    setBatches((prev) =>
      prev.map((b) =>
        b._id !== batchId
          ? b
          : { ...b, suggestions: b.suggestions.map((s, i) => (i === index ? { ...s, ...patch } : s)) }
      )
    );
  };

  const handleSaveEntry = async (batchId) => async (index) => {
    const result = await saveSuggestedOutfit(batchId, index);
    if (result.success) {
      updateEntry(batchId, index, { savedAsOutfit: result.outfit._id });
      toast.success("Outfit saved to My Outfits");
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleToggleFavoriteEntry = (batchId) => async (index) => {
    const result = await toggleSuggestionFavorite(batchId, index);
    if (result.success) {
      updateEntry(batchId, index, { savedAsOutfit: result.outfit._id, isFavorite: result.outfit.isFavorite });
      toast.success(result.outfit.isFavorite ? "Added to favorites" : "Removed from favorites");
    } else {
      toast.error(result.message);
    }
  };

  const handleOpenPlanner = (batch) => async (index) => {
    const entry = batch.suggestions[index];
    let outfit = null;
    if (entry.savedAsOutfit) {
      outfit = { _id: entry.savedAsOutfit, name: entry.label || "AI Outfit", occasion: batch.occasion, items: entry.items };
    } else {
      const result = await handleSaveEntry(batch._id)(index);
      if (!result.success) return;
      outfit = result.outfit;
    }
    setPlannerOutfit(outfit);
  };

  const handleSavePlan = async (payload) => {
    setIsSavingPlan(true);
    const result = await savePlan(payload);
    setIsSavingPlan(false);
    if (result.success) toast.success("Added to your planner");
    else toast.error(result.message);
    return result;
  };

  const handleDelete = async (id) => {
    const result = await deleteSuggestion(id);
    if (result.success) {
      setBatches((prev) => prev.filter((b) => b._id !== id));
      toast.success("Removed from history");
    } else {
      toast.error(result.message);
    }
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
              onClick={() => navigate("/ai-suggestions")}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: "1px solid #E5E7EB" }}
              aria-label="Back"
            >
              <ArrowLeft size={16} style={{ color: "#52557A" }} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
              AI Suggestion History
            </h1>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#FAF8F2", border: "1px solid #E5E7EB" }}
            aria-label="Profile"
          >
            <User size={18} style={{ color: "#52557A" }} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading && batches.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm" style={{ color: "#7C8197" }}>
              Loading your suggestion history...
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#D7D8F6" }}>
                <Sparkles size={22} style={{ color: "#52557A" }} />
              </div>
              <p className="font-semibold" style={{ color: "#2F3447" }}>No AI suggestions yet</p>
              <p className="text-sm max-w-xs" style={{ color: "#7C8197" }}>
                Every batch you generate will show up here so you can revisit or save it later.
              </p>
              <button
                onClick={() => navigate("/ai-suggestions")}
                className="mt-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#4a5280" }}
              >
                Get AI Suggestions
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => {
                const expanded = expandedId === batch._id;
                const badge = STATUS_STYLES[batch.status] || STATUS_STYLES.success;
                return (
                  <div
                    key={batch._id}
                    className="bg-white rounded-[18px] overflow-hidden"
                    style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(47,52,71,0.06)" }}
                  >
                    <button
                      onClick={() => setExpandedId(expanded ? null : batch._id)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EDEBFA" }}>
                          <Sparkles size={16} style={{ color: "#52557A" }} />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-sm font-bold truncate" style={{ color: "#1c1c2e" }}>
                            {batch.occasion}{batch.season ? ` · ${batch.season}` : ""}
                          </p>
                          <p className="text-xs" style={{ color: "#7C8197" }}>
                            {formatDate(batch.createdAt)} · {batch.suggestions.length} outfit{batch.suggestions.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={badge}>
                          {batch.status}
                        </span>
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(batch._id); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                          aria-label="Delete batch"
                        >
                          <Trash2 size={14} style={{ color: "#C0392B" }} />
                        </span>
                        <ChevronDown
                          size={16}
                          style={{ color: "#7C8197", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {batch.suggestions.map((entry, index) => (
                              <AiSuggestionCard
                                key={entry._id || index}
                                entry={entry}
                                batchId={batch._id}
                                index={index}
                                onSave={handleSaveEntry(batch._id)}
                                onToggleFavorite={handleToggleFavoriteEntry(batch._id)}
                                onAddToPlanner={handleOpenPlanner(batch)}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {page < pages && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => load(page + 1, true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium"
                    style={{ border: "1px solid #E5E7EB", color: "#52557A" }}
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
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

export default AiSuggestionHistoryPage;