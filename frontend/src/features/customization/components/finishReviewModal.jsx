import { useState } from "react";
import { X, CheckCircle2, Bookmark, Send, Sparkles } from "lucide-react";
import { buildFinalImagePublicId, buildFinalImageUrl } from "../utils/cloudinaryLayer";
import { getCombinationDetails } from "../utils/finalImageRegistry";
import { getHexForOption } from "./questionnaire/optionStep";
import MannequinCanvas from "./mannequin/mannequinCanvas";

const FAST_CREATION_FEE = 300;

const FinishReviewModal = ({
  isOpen,
  onClose,
  selections,
  price,
  onSaveDesign,
  onSubmitRequest,
  isSaving,
  savedDesignId,
  saveMessage,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [title, setTitle] = useState("");
  const [creationSpeed, setCreationSpeed] = useState("standard");

  if (!isOpen) return null;

  const publicId = buildFinalImagePublicId(selections);
  const finalImageUrl = buildFinalImageUrl(publicId);
  const colorHex = selections.color ? getHexForOption(selections.color) : null;

  const baseTotalPrice = price?.total || 799;
  const extraFee = creationSpeed === "fast" ? FAST_CREATION_FEE : 0;
  const finalCalculatedPrice = baseTotalPrice + extraFee;

  const handleSaveWithSpeed = (customTitle) => {
    onSaveDesign(customTitle, { creationSpeed, fastCreationFee: extraFee, totalPrice: finalCalculatedPrice });
  };

  const handleProceedToCheckout = () => {
    handleSaveWithSpeed(title);
    if (onSubmitRequest) {
      onSubmitRequest();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1c1c2e] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            <h2 className="text-lg font-extrabold tracking-wide">Final Customization Review</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Final 1500x1500 Combined Garment Image */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-md overflow-hidden rounded-2xl bg-[#f8fafc] border border-gray-200 shadow-inner flex items-center justify-center p-4">
              {!imgFailed && finalImageUrl ? (
                <img
                  src={finalImageUrl}
                  alt="Final Combined Custom Design"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <MannequinCanvas selections={selections} lastSelected={{ group: "clothingType", value: selections.clothingType }} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Full Specifications + Creation Option + Price + Checkout */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#1c1c2e] mb-1">
                {selections.clothingType || "Custom Outfit"}
              </h3>
              <p className="text-xs text-gray-400 mb-4">Complete summary of your selected customization details.</p>

              {/* Specifications Table */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <SpecRow label="Clothing Type" value={selections.clothingType} />
                <SpecRow label="Gender" value={selections.gender} />
                <SpecRow label="Fabric" value={selections.fabric} />
                <SpecRow
                  label="Color"
                  value={
                    <span className="flex items-center gap-1.5">
                      {selections.color}
                      {colorHex && (
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
                      )}
                    </span>
                  }
                />
                <SpecRow label="Sleeve" value={selections.sleeveType} />
                <SpecRow label="Neck" value={selections.neckType} />
                <SpecRow label="Length" value={selections.length} />
                <SpecRow label="Pattern" value={selections.pattern} />
                <SpecRow label="Embroidery" value={selections.embroidery} />
                <SpecRow label="Thread Work" value={selections.threadWork} />
                <SpecRow label="Stone Work" value={selections.stoneWork} />
                <SpecRow label="Fit" value={selections.fit} />
              </div>
            </div>

            {/* Creation Speed Service Option */}
            <div className="p-3.5 rounded-2xl border bg-gray-50/80 space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
              <span className="font-extrabold text-[#1c1c2e] block">Creation Speed:</span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                  <input
                    type="radio"
                    name="creationSpeed"
                    value="standard"
                    checked={creationSpeed === "standard"}
                    onChange={() => setCreationSpeed("standard")}
                    className="accent-[#4a5280]"
                  />
                  Standard Creation (₹0 extra)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                  <input
                    type="radio"
                    name="creationSpeed"
                    value="fast"
                    checked={creationSpeed === "fast"}
                    onChange={() => setCreationSpeed("fast")}
                    className="accent-[#4a5280]"
                  />
                  Fast Creation (+₹{FAST_CREATION_FEE})
                </label>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#f0f2fa] border border-[#4a5280]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">
                  Total Final Price {creationSpeed === "fast" && <span className="text-emerald-700">(Fast Creation +₹300)</span>}
                </span>
                <p className="text-2xl font-black text-[#1c1c2e]">₹{finalCalculatedPrice}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                Custom Tailored
              </span>
            </div>

            {/* Action & Checkout Buttons */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Design Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${selections.clothingType || "Custom"} Design`}
                  className="w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-[#4a5280]"
                  style={{ borderColor: "#ede8e0" }}
                />
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#1c1c2e" }}
              >
                <Send size={16} className="text-amber-400" />
                Proceed to Checkout
              </button>

              <button
                onClick={() => handleSaveWithSpeed(title)}
                disabled={isSaving}
                className="w-full py-3 rounded-xl text-xs font-bold text-gray-700 border flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                style={{ borderColor: "#ede8e0" }}
              >
                <Bookmark size={15} />
                {isSaving ? "Saving..." : "Save Custom Design Only"}
              </button>

              {saveMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-center text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>{saveMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
      <span className="text-gray-400 font-medium">{label}:</span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
};

export default FinishReviewModal;
