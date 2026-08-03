import { useState } from "react";
import { X, CheckCircle2, Bookmark, Send, Sparkles } from "lucide-react";
import { buildFinalImagePublicId, buildFinalImageUrl } from "../utils/cloudinaryLayer";
import { getCombinationDetails } from "../utils/finalImageRegistry";
import { getHexForOption } from "./questionnaire/optionStep";
import MannequinCanvas from "./mannequin/mannequinCanvas";

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

  if (!isOpen) return null;

  const publicId = buildFinalImagePublicId(selections);
  const finalImageUrl = buildFinalImageUrl(publicId);
  const comboDetails = getCombinationDetails(selections);
  const colorHex = selections.color ? getHexForOption(selections.color) : null;

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
                /* Fallback preview if 1500x1500 final image is not uploaded to Cloudinary yet */
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <MannequinCanvas selections={selections} lastSelected={{ group: "clothingType", value: selections.clothingType }} />
                  <p className="mt-2 text-[11px] font-semibold text-gray-400 text-center px-4">
                    Previewing initial garment. Upload final 1500×1500 image to:
                    <span className="block text-[10px] text-[#4a5280] font-mono break-all mt-0.5">{publicId}.png</span>
                  </p>
                </div>
              )}
            </div>

            {/* Cloudinary Target Info Card */}
            <div className="w-full max-w-md mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
              <span className="font-bold block mb-1">Target Cloudinary Path:</span>
              <code className="block bg-white p-1.5 rounded border border-amber-200 font-mono text-[10px] break-all select-all text-gray-800">
                {publicId}.png
              </code>
            </div>
          </div>

          {/* Right Column: Full Specifications + Price + Action Buttons */}
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

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#f0f2fa] border border-[#4a5280]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">Final Estimated Price</span>
                <p className="text-2xl font-black text-[#1c1c2e]">₹{price?.total || 799}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                Custom Tailored
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
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

              <button
                onClick={() => onSaveDesign(title)}
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                style={{ backgroundColor: "#4a5280" }}
              >
                <Bookmark size={16} />
                {isSaving ? "Saving Design..." : "Save Custom Design"}
              </button>

              {savedDesignId && (
                <button
                  onClick={onSubmitRequest}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-gray-800 border flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: "#ede8e0" }}
                >
                  <Send size={16} className="text-[#4a5280]" />
                  Submit Design Request
                </button>
              )}

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
