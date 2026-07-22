import { motion, AnimatePresence } from "framer-motion";
import { X, ImageOff, Heart } from "lucide-react";

// Reuses the same "first item with an image" fallback used across the app
// (see planOutfitModal.jsx / favOutfitCard.jsx) so previews stay consistent.
const outfitThumb = (outfit) => outfit?.items?.find((i) => i?.image?.url)?.image?.url || null;

const ChooseFavoritePhotoModal = ({ outfits = [], isLoading = false, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(28,28,46,0.45)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg bg-white rounded-[20px] overflow-hidden flex flex-col"
          style={{ maxHeight: "88vh", boxShadow: "0 20px 60px rgba(28,28,46,0.25)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b shrink-0" style={{ borderColor: "#ede8e0" }}>
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: "#7C8197" }}>CHOOSE PHOTO</p>
              <h3 className="text-lg font-extrabold" style={{ color: "#1c1c2e" }}>Favorite Outfits</h3>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Close">
              <X size={18} style={{ color: "#7C8197" }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoading ? (
              <p className="text-sm text-center py-10" style={{ color: "#7C8197" }}>Loading your favorites...</p>
            ) : outfits.length === 0 ? (
              <div className="text-center py-10">
                <Heart size={26} className="mx-auto mb-3" style={{ color: "#C7C9DC" }} />
                <p className="text-sm font-semibold" style={{ color: "#2F3447" }}>No favorite outfits yet</p>
                <p className="text-xs mt-1" style={{ color: "#7C8197" }}>
                  Mark an outfit as a favorite to use its photo here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {outfits.map((outfit) => {
                  const thumb = outfitThumb(outfit);
                  return (
                    <button
                      key={outfit._id}
                      onClick={() => onSelect(outfit)}
                      className="text-left rounded-xl overflow-hidden border hover:shadow-md transition-shadow"
                      style={{ borderColor: "#E5E7EB" }}
                    >
                      <div className="w-full h-32 flex items-center justify-center" style={{ backgroundColor: "#F5F4FA" }}>
                        {thumb ? (
                          <img src={thumb} alt={outfit.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff size={20} style={{ color: "#C7C9DC" }} />
                        )}
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-xs font-bold truncate" style={{ color: "#2F3447" }}>{outfit.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChooseFavoritePhotoModal;