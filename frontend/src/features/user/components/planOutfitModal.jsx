import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Trash2, Pencil, ImageOff, Check } from "lucide-react";

const formatDateHeading = (dateStr) => {
  // dateStr = "YYYY-MM-DD" — build the Date from parts so it's read as local,
  // never shifted a day by an implicit UTC parse.
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const formatTime = (isoDate) => {
  return new Date(isoDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const outfitThumb = (outfit) => outfit?.items?.find((i) => i?.image?.url)?.image?.url || null;

const PlanOutfitModal = ({
  dateStr,
  existingPlans = [],
  outfits = [],
  isSaving = false,
  onClose,
  onSave, // (payload: { outfitId, time, notes }, editingPlanId | null) => Promise
  onDelete, // (planId) => Promise
}) => {
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(existingPlans.length === 0);

  const filteredOutfits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return outfits;
    return outfits.filter((o) => o.name?.toLowerCase().includes(q));
  }, [outfits, search]);

  const resetForm = () => {
    setEditingPlanId(null);
    setSelectedOutfitId(null);
    setTime("");
    setNotes("");
    setSearch("");
  };

  const startEdit = (plan) => {
    setEditingPlanId(plan._id);
    setSelectedOutfitId(plan.outfit?._id);
    const d = new Date(plan.date);
    setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setNotes(plan.note || "");
    setShowPicker(true);
  };

  const startAddAnother = () => {
    resetForm();
    setShowPicker(true);
  };

  const handleSave = async () => {
    if (!selectedOutfitId) return;
    const result = await onSave({ outfitId: selectedOutfitId, time, notes }, editingPlanId);
    if (result?.success) {
      resetForm();
      setShowPicker(false);
    }
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
          className="w-full max-w-lg bg-white rounded-[20px] overflow-hidden flex flex-col"
          style={{ maxHeight: "88vh", boxShadow: "0 20px 60px rgba(28,28,46,0.25)" }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b shrink-0" style={{ borderColor: "#ede8e0" }}>
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: "#7C8197" }}>PLAN OUTFIT</p>
              <h3 className="text-lg font-extrabold" style={{ color: "#1c1c2e" }}>{formatDateHeading(dateStr)}</h3>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Close">
              <X size={18} style={{ color: "#7C8197" }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* ── Existing plans for this date ── */}
            {existingPlans.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold tracking-wide" style={{ color: "#7C8197" }}>
                  ALREADY PLANNED
                </p>
                {existingPlans.map((plan) => {
                  const thumb = outfitThumb(plan.outfit);
                  return (
                    <div
                      key={plan._id}
                      className="flex items-center gap-3 rounded-xl border p-2.5"
                      style={{ borderColor: "#ede8e0" }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden bg-cover bg-center shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: "#F5F4FA" }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={plan.outfit?.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff size={16} style={{ color: "#C7C9DC" }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate" style={{ color: "#1c1c2e" }}>
                          {plan.outfit?.name || "Deleted outfit"}
                        </p>
                        <p className="text-xs flex items-center gap-1" style={{ color: "#7C8197" }}>
                          <Clock size={11} /> {formatTime(plan.date)}
                          {plan.note ? ` · ${plan.note}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(plan)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Edit plan"
                      >
                        <Pencil size={14} style={{ color: "#7C8197" }} />
                      </button>
                      <button
                        onClick={() => onDelete(plan._id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                        aria-label="Remove plan"
                      >
                        <Trash2 size={14} style={{ color: "#c2504f" }} />
                      </button>
                    </div>
                  );
                })}

                {!showPicker && (
                  <button
                    onClick={startAddAnother}
                    className="text-xs font-semibold"
                    style={{ color: "#4a5280" }}
                  >
                    + Plan another outfit for this day
                  </button>
                )}
              </div>
            )}

            {/* ── Picker / form ── */}
            {showPicker && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide mb-2" style={{ color: "#7C8197" }}>
                    {editingPlanId ? "CHANGE OUTFIT" : "CHOOSE AN OUTFIT"}
                  </p>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your outfits..."
                    className="w-full mb-3 px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "#ede8e0" }}
                  />

                  {outfits.length === 0 ? (
                    <div className="text-sm text-center py-8" style={{ color: "#7C8197" }}>
                      You haven't created any outfits yet. Build one from the Outfits page first.
                    </div>
                  ) : filteredOutfits.length === 0 ? (
                    <div className="text-sm text-center py-8" style={{ color: "#7C8197" }}>
                      No outfits match "{search}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {filteredOutfits.map((outfit) => {
                        const thumb = outfitThumb(outfit);
                        const active = selectedOutfitId === outfit._id;
                        return (
                          <button
                            key={outfit._id}
                            onClick={() => setSelectedOutfitId(outfit._id)}
                            className="rounded-xl overflow-hidden text-left relative"
                            style={{
                              border: active ? "2px solid #4a5280" : "1px solid #ede8e0",
                            }}
                          >
                            <div
                              className="w-full h-20 bg-cover bg-center flex items-center justify-center"
                              style={{ backgroundColor: "#F5F4FA" }}
                            >
                              {thumb ? (
                                <img src={thumb} alt={outfit.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageOff size={16} style={{ color: "#C7C9DC" }} />
                              )}
                              {active && (
                                <div
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: "#4a5280" }}
                                >
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] font-semibold px-1.5 py-1 truncate" style={{ color: "#1c1c2e" }}>
                              {outfit.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
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

                <div className="flex items-center gap-3">
                  {existingPlans.length > 0 && (
                    <button
                      onClick={() => {
                        resetForm();
                        setShowPicker(false);
                      }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ color: "#7C8197" }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!selectedOutfitId || isSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#4a5280" }}
                  >
                    {isSaving ? "Saving..." : editingPlanId ? "Update Plan" : "Save Plan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanOutfitModal;