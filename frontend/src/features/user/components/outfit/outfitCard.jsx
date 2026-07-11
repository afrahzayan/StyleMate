import { motion } from "framer-motion";
import { Heart, ImageOff, Pencil } from "lucide-react";

// ── Mosaic layout ──────────────────────────────────────────────
// Arranges however many wardrobe items an outfit has into a Pinterest-style
// grid. 3 items (the common case: top + bottom + foot wears) gets the signature
// "large left, two stacked right" layout from the reference design; other
// counts fall back to sensible grids so the card never breaks.
const getSlotClasses = (count, index) => {
  if (count === 1) return "col-span-2 row-span-2";
  if (count === 2) return "row-span-2";
  if (count === 3) {
    if (index === 0) return "row-span-2";
    return "row-span-1";
  }
  // 4 or more — plain 2x2, extras are folded into a "+N" overlay on the last tile
  return "row-span-1";
};

const visibleCount = (total) => Math.min(total, 4);

const OutfitCard = ({ outfit, onToggleFavorite, onClick }) => {
  const items = outfit.items || [];
  const shown = visibleCount(items.length);
  const extra = items.length - shown;

  const formattedDate = outfit.updatedAt
    ? new Date(outfit.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      className="group cursor-pointer rounded-[20px] bg-white overflow-hidden"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(47,52,71,0.06)",
      }}
    >
      {/* ── Image mosaic ── */}
      <div className="p-2.5">
        <div
          className="grid grid-cols-2 grid-rows-2 gap-1.5 rounded-[14px] overflow-hidden"
          style={{ height: "230px" }}
        >
          {items.length === 0 && (
            <div
              className="col-span-2 row-span-2 flex items-center justify-center"
              style={{ backgroundColor: "#F5F4FA" }}
            >
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

              {/* "+N more" overlay on the last visible tile */}
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

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-1">
        <div className="min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "#2F3447" }}>
            {outfit.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#7C8197" }}>
            Last updated: {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(e, { edit: true });
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#7C8197" }}
            aria-label="Edit outfit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(e, outfit._id);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Toggle favorite"
          >
            <Heart
              size={17}
              fill={outfit.isFavorite ? "#52557A" : "none"}
              style={{ color: "#52557A" }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OutfitCard;