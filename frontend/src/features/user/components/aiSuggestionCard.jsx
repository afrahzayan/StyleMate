import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ImageOff, CalendarPlus, Check, Loader2 } from "lucide-react";

const getSlotClasses = (count, index) => {
  if (count === 1) return "col-span-2 row-span-2";
  if (count === 2) return "row-span-2";
  if (count === 3) return index === 0 ? "row-span-2" : "row-span-1";
  return "row-span-1";
};
const visibleCount = (total) => Math.min(total, 4);

const AiSuggestionCard = ({ entry, batchId, index, onSave, onToggleFavorite, onAddToPlanner }) => {
  const [saving, setSaving] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const items = entry.items || [];
  const shown = visibleCount(items.length);
  const extra = items.length - shown;
  const isSaved = !!entry.savedAsOutfit;

  const handleSave = async () => {
    if (isSaved || saving) return;
    setSaving(true);
    await onSave(index);
    setSaving(false);
  };

  const handleFavorite = async () => {
    if (favoriting) return;
    setFavoriting(true);
    await onToggleFavorite(index);
    setFavoriting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-[20px] bg-white overflow-hidden flex flex-col"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(47,52,71,0.06)" }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="text-base font-bold" style={{ color: "#2F3447" }}>
          {entry.label || `Outfit ${index + 1}`}
        </h3>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#EDEBFA", color: "#52557A" }}
        >
          {entry.confidence != null ? `${entry.confidence}% Match` : "—"}
        </span>
      </div>

      <div className="p-2.5">
        <div
          className="grid grid-cols-2 grid-rows-2 gap-1.5 rounded-[14px] overflow-hidden"
          style={{ height: "230px" }}
        >
          {items.length === 0 && (
            <div className="col-span-2 row-span-2 flex items-center justify-center" style={{ backgroundColor: "#F5F4FA" }}>
              <ImageOff size={26} style={{ color: "#C7C9DC" }} />
            </div>
          )}
          {items.slice(0, shown).map((item, i) => (
            <div
              key={item._id || i}
              className={`relative overflow-hidden ${getSlotClasses(items.length, i)}`}
              style={{ backgroundColor: "#F5F4FA" }}
            >
              {item?.image?.url ? (
                <img src={item.image.url} alt={item.name || "outfit item"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff size={20} style={{ color: "#C7C9DC" }} />
                </div>
              )}
              {i === shown - 1 && extra > 0 && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: "rgba(47,52,71,0.55)" }}
                >
                  +{extra} more
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {entry.explanation && (
        <p className="text-xs px-4 leading-relaxed" style={{ color: "#7C8197" }}>
          {entry.explanation}
        </p>
      )}

      <div className="mt-auto p-4 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isSaved || saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-70"
          style={{
            borderColor: "#52557A",
            color: isSaved ? "#ffffff" : "#52557A",
            backgroundColor: isSaved ? "#52557A" : "transparent",
          }}
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isSaved ? (
            <Check size={15} />
          ) : null}
          {isSaved ? "Saved" : "Save Outfit"}
        </button>

        <button
          onClick={handleFavorite}
          disabled={favoriting}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ border: "1px solid #E5E7EB" }}
          aria-label="Toggle favorite"
        >
          <Heart size={16} fill={entry.isFavorite ? "#52557A" : "none"} style={{ color: "#52557A" }} />
        </button>

        <button
          onClick={() => onAddToPlanner(index)}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ border: "1px solid #E5E7EB" }}
          aria-label="Add to planner"
        >
          <CalendarPlus size={16} style={{ color: "#52557A" }} />
        </button>
      </div>
    </motion.div>
  );
};

export default AiSuggestionCard;