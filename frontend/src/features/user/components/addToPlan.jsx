import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImageOff, CalendarDays } from "lucide-react";

const outfitThumb = (outfit) => outfit?.items?.find((i) => i?.image?.url)?.image?.url || null;

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const AddToPlannerModal = ({ outfit, isSaving = false, onClose, onSave }) => {
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const thumb = outfitThumb(outfit);

  const handleSave = async () => {
    if (!date) return;
    const result = await onSave({ outfitId: outfit._id, date, time, notes });
    if (result?.success) onClose();
  };

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
          className="w-full max-w-sm bg-white rounded-[20px] overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(28,28,46,0.25)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#ede8e0" }}>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} style={{ color: "#52557A" }} />
              <p className="text-xs font-semibold tracking-wide" style={{ color: "#7C8197" }}>ADD TO PLANNER</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Close">
              <X size={18} style={{ color: "#7C8197" }} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: "#ede8e0" }}>
              <div
                className="w-12 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                style={{ backgroundColor: "#F5F4FA" }}
              >
                {thumb ? (
                  <img src={thumb} alt={outfit?.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={16} style={{ color: "#C7C9DC" }} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "#1c1c2e" }}>{outfit?.name}</p>
                <p className="text-xs" style={{ color: "#7C8197" }}>{outfit?.occasion}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "#7C8197" }}>
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: "#ede8e0" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "#7C8197" }}>
                  TIME (OPTIONAL)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "#ede8e0" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "#7C8197" }}>
                  NOTE (OPTIONAL)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Team lunch"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "#ede8e0" }}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!date || isSaving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#4a5280" }}
            >
              {isSaving ? "Saving..." : "Add to Planner"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddToPlannerModal;