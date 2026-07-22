import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, X, Sparkles, Upload, Heart } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../../user/components/sidebar";
import useOutfits from "../../user/hooks/useOutfits";
import useCommunity from "../hooks/useCommunity";
import ChooseFavoritePhotoModal from "../components/chooseFavPhotomodal";

const OCCASIONS = [
  "Casual", "Formal", "Office", "Business Meeting", "College", "School",
  "Party", "Wedding", "Reception", "Traditional", "Festival", "Eid",
  "Vacation", "Travel", "Beach", "Date Night", "Family Gathering", "Brunch",
  "Dinner", "Sports", "Gym", "Shopping", "Outdoor", "Winter", "Summer",
  "Rainy Day", "Home Wear", "Photoshoot", "Special Event", "Other",
];
const STYLES = ["Elegant", "Minimal", "Streetwear", "Classic", "Boho", "Edgy", "Sporty"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All Season"];

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { fetchOutfits } = useOutfits();
  const { createPost, isLoading } = useCommunity();
  const fileInputRef = useRef(null);

  const [outfits, setOutfits] = useState([]);
  const [selectedOutfitId, setSelectedOutfitId] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [occasion, setOccasion] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [style, setStyle] = useState("");
  const [season, setSeason] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [outfitType, setOutfitType] = useState("manual");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isImportingFavorite, setIsImportingFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await fetchOutfits({ sort: "recent" });
      if (result.success) setOutfits(result.outfits);
    })();
  }, []);

  const openFavoriteModal = async () => {
    setIsFavoriteModalOpen(true);
    if (favoriteOutfits.length === 0) {
      setIsLoadingFavorites(true);
      const result = await fetchOutfits({ favorite: true, sort: "recent" });
      if (result.success) setFavoriteOutfits(result.outfits);
      setIsLoadingFavorites(false);
    }
  };

  const handleSelectFavoritePhoto = async (outfit) => {
    const thumbUrl = outfit?.items?.find((i) => i?.image?.url)?.image?.url;
    if (!thumbUrl) {
      toast.error("This outfit doesn't have a usable photo");
      return;
    }
    setIsImportingFavorite(true);
    try {
      const res = await fetch(thumbUrl);
      const blob = await res.blob();
      const file = new File([blob], `${outfit.name || "favorite-outfit"}.jpg`, { type: blob.type || "image/jpeg" });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsFavoriteModalOpen(false);
    } catch (err) {
      toast.error("Couldn't load that photo, please try again");
    } finally {
      setIsImportingFavorite(false);
    }
  };

  const selectedOutfit = outfits.find((o) => o._id === selectedOutfitId);

  useEffect(() => {
    if (selectedOutfit) {
      if (!title) setTitle(selectedOutfit.name);
      setOccasion(selectedOutfit.occasion || "");
      setOutfitType(selectedOutfit.source === "ai" ? "ai" : "manual");
    }
  }, [selectedOutfitId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const clean = tagInput.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handlePublish = async () => {
    if (!selectedOutfitId) {
      toast.error("Please select one of your outfits to share");
      return;
    }

    if (occasion === "Other" && !customOccasion.trim()) {
      toast.error("Please type your custom occasion, or pick one from the list");
      return;
    }
    const finalOccasion = occasion === "Other" ? customOccasion.trim() : occasion;

    const formData = new FormData();
    formData.append("linkedOutfit", selectedOutfitId);
    formData.append("title", title);
    formData.append("caption", caption);
    formData.append("occasion", finalOccasion);
    formData.append("style", style);
    formData.append("season", season);
    formData.append("tags", tags.join(","));
    formData.append("outfitType", outfitType);
    if (imageFile) formData.append("image", imageFile);

    const result = await createPost(formData);
    if (result.success) {
      toast.success("Post published to the community!");
      navigate("/community");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-8 py-5 bg-white border-b shrink-0" style={{ borderColor: "#E5E7EB" }}>
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
              Share Your Outfit
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#7C8197" }}>Inspire the community with your latest style creation.</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
            <div
              className="rounded-2xl bg-white p-6 flex flex-col items-center justify-center text-center min-h-[380px]"
              style={{ border: "1px solid #E5E7EB" }}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-80 object-cover rounded-xl" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/90"
                  >
                    <X size={14} style={{ color: "#2F3447" }} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#EDEBFA" }}>
                    <ImagePlus size={26} style={{ color: "#52557A" }} />
                  </div>
                  <p className="text-base font-bold mb-1" style={{ color: "#1c1c2e" }}>Add an outfit photo</p>
                  <p className="text-xs mb-4 max-w-xs" style={{ color: "#7C8197" }}>
                    Optional — leave blank to use your outfit's item photos instead.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: "#4a5280" }}
                    >
                      <Upload size={14} />
                      Upload from Device
                    </button>
                    <button
                      onClick={openFavoriteModal}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
                      style={{ borderColor: "#E5E7EB", color: "#2F3447" }}
                    >
                      <Heart size={14} />
                      Choose from Favorite Outfits
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                </>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 space-y-5" style={{ border: "1px solid #E5E7EB" }}>
              <div>
                <label className="text-xs font-semibold" style={{ color: "#7C8197" }}>Select Outfit</label>
                <select
                  value={selectedOutfitId}
                  onChange={(e) => setSelectedOutfitId(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={{ borderColor: "#E5E7EB", color: "#2F3447" }}
                >
                  <option value="">Choose one of your outfits...</option>
                  {outfits.map((o) => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
                {outfits.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: "#C0392B" }}>
                    You don't have any outfits yet — build one first in Outfit Builder.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: "#7C8197" }}>Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a story about this look... Where did you wear it?"
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: "#E5E7EB" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold" style={{ color: "#7C8197" }}>Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => { setOccasion(e.target.value); if (e.target.value !== "Other") setCustomOccasion(""); }}
                    className="w-full mt-1 px-2 py-2.5 rounded-xl border text-sm outline-none bg-white"
                    style={{ borderColor: "#E5E7EB", color: "#2F3447" }}
                  >
                    <option value="">Select</option>
                    {OCCASIONS.map((o) => <option key={o} value={o}>{o === "Other" ? "Other (Write your own)" : o}</option>)}
                  </select>
                  {occasion === "Other" && (
                    <input
                      value={customOccasion}
                      onChange={(e) => setCustomOccasion(e.target.value)}
                      placeholder="Enter occasion"
                      className="w-full mt-2 px-3 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "#E5E7EB", color: "#2F3447" }}
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ color: "#7C8197" }}>Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full mt-1 px-2 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: "#E5E7EB", color: "#2F3447" }}>
                    <option value="">Select</option>
                    {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ color: "#7C8197" }}>Season</label>
                  <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full mt-1 px-2 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: "#E5E7EB", color: "#2F3447" }}>
                    <option value="">Select</option>
                    {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: "#7C8197" }}>Tags</label>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add #hashtags and press Enter"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#E5E7EB" }}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((t) => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#EDEBFA", color: "#52557A" }}>
                        #{t}
                        <button onClick={() => removeTag(t)}><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "#7C8197" }}>Outfit Type</label>
                <div className="flex gap-4">
                  <button onClick={() => setOutfitType("manual")} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#2F3447" }}>
                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: outfitType === "manual" ? "#4a5280" : "#E5E7EB" }}>
                      {outfitType === "manual" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4a5280" }} />}
                    </span>
                    Manual Outfit
                  </button>
                  <button onClick={() => setOutfitType("ai")} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#2F3447" }}>
                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: outfitType === "ai" ? "#4a5280" : "#E5E7EB" }}>
                      {outfitType === "ai" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4a5280" }} />}
                    </span>
                    <Sparkles size={13} />
                    AI Generated Outfit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mt-6 rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: "#F5F4FA" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "#2F3447" }}>Community Guidelines</p>
              <p className="text-xs mt-1" style={{ color: "#7C8197" }}>
                By publishing, you agree to share this look with the StyleMate community. Ensure you have the rights to any photos uploaded.
              </p>
            </div>
          </div>

          <div className="max-w-5xl mt-4 flex justify-end gap-3">
            <button
              onClick={() => navigate("/community")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border"
              style={{ borderColor: "#E5E7EB", color: "#2F3447" }}
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#4a5280" }}
            >
              {isLoading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </main>
      </div>

      {isFavoriteModalOpen && (
        <ChooseFavoritePhotoModal
          outfits={favoriteOutfits}
          isLoading={isLoadingFavorites || isImportingFavorite}
          onClose={() => setIsFavoriteModalOpen(false)}
          onSelect={handleSelectFavoritePhoto}
        />
      )}
    </div>
  );
};

export default CreatePostPage;