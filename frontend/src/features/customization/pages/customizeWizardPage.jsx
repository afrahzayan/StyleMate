import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, CheckCircle2, Bookmark, Sparkles } from "lucide-react";
import Sidebar from "../../user/components/sidebar";
import useCustomizationWizard from "../hooks/useCustomizationWizard";
import useLivePrice from "../hooks/useLivePrice";
import useMyDesigns from "../hooks/useMyDesigns";
import StepWizard from "../components/questionnaire/stepWizard";
import OptionStep from "../components/questionnaire/optionStep";
import MannequinCanvas from "../components/mannequin/mannequinCanvas";
import PriceBreakdownPanel from "../components/priceBreakeDownPanel";
import DesignStudioPanel from "../components/designStudioPanel";
import FinishReviewModal from "../components/finishReviewModal";
import { resolveSingleLayer } from "../components/mannequin/layerRegistry";
import { getClothingTypeImageUrl } from "../utils/cloudinaryLayer";

const QUIZ_STEPS = [
  { group: "gender", label: "Who is this outfit for?" },
  { group: "ageGroup", label: "Age group" },
  { group: "occasion", label: "What's the occasion?" },
  { group: "dressCategory", label: "Dress category" },
  { group: "clothingType", label: "Choose a clothing type" },
  { group: "fit", label: "Preferred fit" },
];

const CustomizeWizardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { state, setOption, setMeasurement, setNotes, nextStep, prevStep, loadSavedSelections } = useCustomizationWizard();
  const { saveDesign, isLoading: isSaving } = useMyDesigns();
  const [phase, setPhase] = useState("quiz"); // "quiz" | "studio"
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Pre-load saved design selections if user arrived via "Edit Design"
  useEffect(() => {
    const editDesign = location.state?.editDesign || location.state?.savedDesign;
    if (editDesign && editDesign.selections) {
      loadSavedSelections(editDesign.selections);
      if (editDesign.title) setTitle(editDesign.title);
      setPhase("studio");
    }
  }, [location.state]);

  const { price, isCalculating } = useLivePrice(state.selections.clothingType, state.selections);

  const currentQuizStep = QUIZ_STEPS[state.step];
  const canGoNext = Boolean(state.selections[currentQuizStep?.group]);

  const handleQuizNext = () => {
    if (state.step < QUIZ_STEPS.length - 1) {
      nextStep();
    } else {
      setPhase("studio");
    }
  };

  const handleSaveDesign = async (customTitle, extraOptions = {}) => {
    setSaveMessage("");
    const designTitle = customTitle || title.trim() || `${state.selections.clothingType || "Custom"} Design`;
    const previewLayer = resolveSingleLayer(state.lastSelected, state.selections);
    const finalPrice = extraOptions.totalPrice || price.total || 799;

    const result = await saveDesign({
      title: designTitle,
      previewImage: {
        url: previewLayer?.src || getClothingTypeImageUrl(state.selections.clothingType),
        publicId: `${state.selections.clothingType || "design"}-preview`,
      },
      clothingType: state.selections.clothingType,
      selections: state.selections,
      measurements: state.selections.measurements,
      price: finalPrice,
      creationSpeed: extraOptions.creationSpeed || "standard",
      fastCreationFee: extraOptions.fastCreationFee || 0,
    });

    if (result.success) {
      setSaveMessage("Design saved to Saved Designs!");
    } else {
      setSaveMessage(result.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => (phase === "studio" ? setPhase("quiz") : navigate(-1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <div>
              <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
                {phase === "quiz" ? "Basic Onboarding Questions" : "Live Design Studio"}
              </h1>
              <p className="text-xs text-gray-400">
                {phase === "quiz" ? `Step ${state.step + 1} of ${QUIZ_STEPS.length}` : "Real-time Cloudinary customization"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === "studio" && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:opacity-90"
                style={{ backgroundColor: "#1c1c2e" }}
              >
                <Sparkles size={14} className="text-amber-400" />
                Finish & Review
              </button>
            )}

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-gray-700 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: "#4a5280" }}
              >
                {user?.profileImage?.url ? (
                  <img src={user.profileImage.url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-7 py-6">
          {phase === "quiz" ? (
            <div className="mx-auto max-w-xl bg-white rounded-2xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: "#ede8e0" }}>
              <StepWizard
                stepIndex={state.step}
                totalSteps={QUIZ_STEPS.length}
                onPrev={prevStep}
                onNext={handleQuizNext}
                canGoNext={canGoNext}
              >
                <OptionStep
                  group={currentQuizStep.group}
                  label={currentQuizStep.label}
                  value={state.selections[currentQuizStep.group]}
                  gender={state.selections.gender}
                  onSelect={(value) => setOption(currentQuizStep.group, value)}
                />
              </StepWizard>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Customization Controls */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "#ede8e0" }}>
                <div className="flex items-center justify-between pb-4 mb-6 border-b" style={{ borderColor: "#ede8e0" }}>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color: "#1c1c2e" }}>
                      Customization Options
                    </h2>
                    <p className="text-xs text-gray-400">
                      Select fabric, color shades, sleeves, neck, pattern & work details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhase("quiz")}
                    className="text-xs font-bold text-[#4a5280] hover:underline"
                  >
                    Edit Basics
                  </button>
                </div>

                <DesignStudioPanel
                  selections={state.selections}
                  onSelect={setOption}
                  onMeasurementChange={setMeasurement}
                  notes={state.additionalRequirements}
                  onNotesChange={setNotes}
                />
              </div>

              {/* Right Column: Live Garment Preview + Live Price */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-0 self-start">
                {/* Mannequin Live Preview Card */}
                <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "#ede8e0" }}>
                  <h3 className="text-sm font-extrabold mb-4 flex items-center justify-between" style={{ color: "#1c1c2e" }}>
                    <span>Live Garment Preview</span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Single Option View
                    </span>
                  </h3>
                  <MannequinCanvas selections={state.selections} lastSelected={state.lastSelected} />
                </div>

                {/* Live Price Calculation Card */}
                <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "#ede8e0" }}>
                  <PriceBreakdownPanel price={price} isCalculating={isCalculating} />
                </div>

                {/* Save / Finish Actions */}
                <div className="bg-white rounded-2xl p-6 border space-y-3 shadow-sm" style={{ borderColor: "#ede8e0" }}>
                  {/* Primary Finish & Review Button */}
                  <button
                    onClick={() => setIsReviewOpen(true)}
                    className="w-full py-3.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:opacity-90"
                    style={{ backgroundColor: "#1c1c2e" }}
                  >
                    <Sparkles size={16} className="text-amber-400" />
                    Finish & Review Design
                  </button>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Design Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Custom Dress"
                      className="w-full px-4 py-2 rounded-xl border text-xs font-medium outline-none focus:border-[#4a5280]"
                      style={{ borderColor: "#ede8e0" }}
                    />
                  </div>

                  <button
                    onClick={() => handleSaveDesign()}
                    disabled={isSaving || !state.selections.clothingType}
                    className="w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-sm"
                    style={{ backgroundColor: "#4a5280" }}
                  >
                    <Bookmark size={15} />
                    {isSaving ? "Saving..." : "Save Custom Design"}
                  </button>

                  {saveMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-center text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>{saveMessage}</span>
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/designs/saved")}
                    className="w-full text-center text-xs font-semibold text-[#4a5280] hover:underline pt-1"
                  >
                    View My Saved Designs →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Finish & Review Modal */}
      <FinishReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        selections={state.selections}
        price={price}
        onSaveDesign={handleSaveDesign}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />
    </div>
  );
};

export default CustomizeWizardPage;