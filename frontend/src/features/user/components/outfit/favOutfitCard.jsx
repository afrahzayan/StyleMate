import { motion } from "framer-motion";
import { Heart, ImageOff, CalendarPlus } from "lucide-react";

const getSlotClasses = (count, index) => {
  if (count === 1) return "col-span-2 row-span-2";
  if (count === 2) return "row-span-2";
  if (count === 3) {
    if (index === 0) return "row-span-2";
    return "row-span-1";
  }
  return "row-span-1";
};

const visibleCount = (total) => Math.min(total, 4);

const OCCASION_BADGE_COLORS = {
  Formal: "#2F3447",
  Casual: "#52557A",
  Party: "#8B4A6B",
  Work: "#3d4467",
  Wedding: "#9B7B4A",
  Eid: "#4A7B5F",
  Other: "#6B6F82",
};

const FavoriteOutfitCard = ({ outfit, onToggleFavorite, onAddToPlanner, onClick }) => {
  const items = outfit.items || [];
  const shown = visibleCount(items.length);
  const extra = items.length - shown;
  const badgeColor = OCCASION_BADGE_COLORS[outfit.occasion] || "#52557A";

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group rounded-[20px] bg-white overflow-hidden flex flex-col"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(47,52,71,0.06)" }}
    >
      <div className="p-2.5 cursor-pointer" onClick={onClick}>
        <div className="grid grid-cols-2 grid-rows-2 gap-1.5 rounded-[14px] overflow-hidden relative" style={{ height: "230px" }}>
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
              {item.image?.url ? (
                <img
                  src={item.image.url}
                  alt={item.name || "outfit item"}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(e, outfit._id);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm z-10"
            style={{ boxShadow: "0 2px 8px rgba(47,52,71,0.15)" }}
            aria-label="Remove from favorites"
          >
            <Heart size={15} fill="#52557A" style={{ color: "#52557A" }} />
          </button>

          <span
            className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide text-white uppercase z-10"
            style={{ backgroundColor: badgeColor }}
          >
            {outfit.occasion}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
        <p className="text-sm font-bold cursor-pointer" style={{ color: "#2F3447" }} onClick={onClick}>
          {outfit.name}
        </p>
        <p className="text-xs mt-0.5 mb-3" style={{ color: "#7C8197" }}>
          {items.length} item{items.length === 1 ? "" : "s"} · Worn {outfit.timesWorn || 0} time{outfit.timesWorn === 1 ? "" : "s"}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlanner?.(outfit);
          }}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "#52557A" }}
        >
          <CalendarPlus size={15} />
          Add to Planner
        </button>
      </div>
    </motion.div>
  );
};

export default FavoriteOutfitCard;