import { useState } from "react";
import { X, Flag } from "lucide-react";

const REASONS = ["Inappropriate", "Spam", "Abuse", "Misinformation", "Other"];

const ReportModal = ({ post, onClose, onSubmit }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category) return;
    setSubmitting(true);
    await onSubmit(post._id, { category, description });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl p-6 w-96 shadow-xl" style={{ backgroundColor: "#ffffff" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag size={16} style={{ color: "#C0392B" }} />
            <h3 className="text-base font-bold" style={{ color: "#1c1c2e" }}>Report post</h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} style={{ color: "#7C8197" }} />
          </button>
        </div>

        <p className="text-xs mb-3" style={{ color: "#7C8197" }}>Why are you reporting this post?</p>

        <div className="space-y-2 mb-4">
          {REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setCategory(reason)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={{
                borderColor: category === reason ? "#52557A" : "#E5E7EB",
                backgroundColor: category === reason ? "#EDEBFA" : "#ffffff",
                color: "#2F3447",
              }}
            >
              {reason}
            </button>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details (optional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none mb-4"
          style={{ borderColor: "#E5E7EB" }}
        />

        <button
          onClick={handleSubmit}
          disabled={!category || submitting}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "#C0392B" }}
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
};

export default ReportModal;