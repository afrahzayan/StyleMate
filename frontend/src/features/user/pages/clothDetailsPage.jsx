import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Trash2, Sparkles, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import useWardrobe from "../hooks/useWardrobe";

const CATEGORY_OPTIONS = ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];
const GENDER_OPTIONS = ["Men", "Women", "Unisex"];
const FORMALITY_OPTIONS = ["Formal", "Casual", "Semi-Formal"];
const CONDITION_OPTIONS = ["New", "Good", "Worn", "Damaged"];
const LAYERING_OPTIONS = ["Base", "Mid", "Outer"];

// Simple labeled text input, reused throughout the form
const Field = ({ label, value, onChange, placeholder = "Not detected" }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
      {label}
    </label>
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
      style={{ borderColor: "#e5e7eb" }}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, allowEmpty = true }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
      {label}
    </label>
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white"
      style={{ borderColor: "#e5e7eb" }}
    >
      {allowEmpty && <option value="">Not set</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ClothDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, fetchClothById, updateCloth, toggleFavorite, deleteCloth } = useWardrobe();

  const [cloth, setCloth] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await fetchClothById(id);
      if (result.success) {
        setCloth(result.cloth);
      } else {
        toast.error(result.message);
        navigate("/wardrobe");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (field, value) => setCloth((prev) => ({ ...prev, [field]: value }));
  const setColor = (key, value) =>
    setCloth((prev) => ({ ...prev, color: { ...prev.color, [key]: value } }));

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateCloth(id, {
      name: cloth.name,
      description: cloth.description,
      category: cloth.category,
      subCategory: cloth.subCategory,
      color: cloth.color,
      pattern: cloth.pattern,
      sleeveType: cloth.sleeveType,
      neckType: cloth.neckType,
      fit: cloth.fit,
      fabric: cloth.fabric,
      genderSuitability: cloth.genderSuitability,
      style: cloth.style,
      occasion: cloth.occasion,
      season: cloth.season,
      formality: cloth.formality,
      brand: cloth.brand,
      texture: cloth.texture,
      length: cloth.length,
      condition: cloth.condition,
      layeringType: cloth.layeringType,
      tags: cloth.tags,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Changes saved");
      setCloth(result.cloth);
    } else {
      toast.error(result.message);
    }
  };

  const handleFavorite = async () => {
    const result = await toggleFavorite(id);
    if (result.success) set("isFavorite", result.cloth.isFavorite);
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this item from your wardrobe?")) return;
    const result = await deleteCloth(id);
    if (result.success) {
      toast.success("Item removed");
      navigate("/wardrobe");
    } else {
      toast.error(result.message);
    }
  };

  if (isLoading && !cloth) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: "#faf8f5" }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Loading item...
        </div>
      </div>
    );
  }

  if (!cloth) return null;

  const confidenceValues = Object.values(cloth.aiMeta?.confidenceScores || {}).filter(
    (v) => typeof v === "number"
  );
  const avgConfidence =
    confidenceValues.length > 0
      ? Math.round((confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 100)
      : null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <button
            onClick={() => navigate("/wardrobe")}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "#374151" }}
          >
            <ArrowLeft size={15} />
            Back to Wardrobe
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className="w-9 h-9 rounded-full border flex items-center justify-center"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Heart size={15} fill={cloth.isFavorite ? "#4a5280" : "none"} style={{ color: "#4a5280" }} />
            </button>
            <button
              onClick={handleDelete}
              className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-red-50"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Trash2 size={15} className="text-red-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-7 py-7">
          <div className="max-w-3xl grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            {/* Image + AI status */}
            <div>
              <div
                className="rounded-2xl overflow-hidden border aspect-square"
                style={{ borderColor: "#ede8e0" }}
              >
                {cloth.image?.url && (
                  <img src={cloth.image.url} alt={cloth.name} className="w-full h-full object-cover" />
                )}
              </div>

              {cloth.aiMeta?.analysisFailed ? (
                <div
                  className="mt-4 flex items-start gap-2 p-3 rounded-lg text-xs"
                  style={{ backgroundColor: "#fef3f2", color: "#b42318" }}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    AI couldn't analyze this image. Fields below are empty — fill in what you'd
                    like manually.
                  </span>
                </div>
              ) : avgConfidence !== null ? (
                <div
                  className="mt-4 flex items-center gap-2 p-3 rounded-lg text-xs"
                  style={{ backgroundColor: "#f0f2fa", color: "#4a5280" }}
                >
                  <Sparkles size={14} className="shrink-0" />
                  <span>AI detection confidence: ~{avgConfidence}%</span>
                </div>
              ) : null}
            </div>

            {/* Editable fields */}
            <div className="space-y-5">
              <Field label="Name" value={cloth.name} onChange={(v) => set("name", v)} />

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Description
                </label>
                <textarea
                  value={cloth.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  value={cloth.category}
                  onChange={(v) => set("category", v)}
                  options={CATEGORY_OPTIONS}
                  allowEmpty={false}
                />
                <Field
                  label="Sub-category"
                  value={cloth.subCategory}
                  onChange={(v) => set("subCategory", v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Primary Color"
                  value={cloth.color?.primary}
                  onChange={(v) => setColor("primary", v)}
                />
                <Field
                  label="Secondary Colors (comma separated)"
                  value={(cloth.color?.secondary || []).join(", ")}
                  onChange={(v) =>
                    setColor(
                      "secondary",
                      v.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Pattern" value={cloth.pattern} onChange={(v) => set("pattern", v)} />
                <Field label="Fit" value={cloth.fit} onChange={(v) => set("fit", v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Sleeve Type" value={cloth.sleeveType} onChange={(v) => set("sleeveType", v)} />
                <Field label="Neck Type" value={cloth.neckType} onChange={(v) => set("neckType", v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Fabric" value={cloth.fabric} onChange={(v) => set("fabric", v)} />
                <Field label="Texture" value={cloth.texture} onChange={(v) => set("texture", v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Gender Suitability"
                  value={cloth.genderSuitability}
                  onChange={(v) => set("genderSuitability", v)}
                  options={GENDER_OPTIONS}
                />
                <SelectField
                  label="Formality"
                  value={cloth.formality}
                  onChange={(v) => set("formality", v)}
                  options={FORMALITY_OPTIONS}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Style" value={cloth.style} onChange={(v) => set("style", v)} />
                <Field label="Length" value={cloth.length} onChange={(v) => set("length", v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Occasion" value={cloth.occasion} onChange={(v) => set("occasion", v)} />
                <Field label="Season" value={cloth.season} onChange={(v) => set("season", v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Condition"
                  value={cloth.condition}
                  onChange={(v) => set("condition", v)}
                  options={CONDITION_OPTIONS}
                />
                <SelectField
                  label="Layering Type"
                  value={cloth.layeringType}
                  onChange={(v) => set("layeringType", v)}
                  options={LAYERING_OPTIONS}
                />
              </div>

              <Field label="Brand" value={cloth.brand} onChange={(v) => set("brand", v)} placeholder="Not visible" />

              <Field
                label="Tags (comma separated)"
                value={(cloth.tags || []).join(", ")}
                onChange={(v) =>
                  set(
                    "tags",
                    v.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
              />

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70"
                style={{ backgroundColor: "#4a5280" }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClothDetailPage;