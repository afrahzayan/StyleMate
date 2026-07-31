import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomizationWizard from "../hooks/useCustomizationWizard";
import useLivePrice from "../hooks/useLivePrice";
import useMyDesigns from "../hooks/useMyDesigns";
import StepWizard from "../components/questionnaire/stepWizard";
import OptionStep from "../components/questionnaire/optionStep";
import MannequinCanvas from "../components/mannequin/mannequinCanvas";
import PriceBreakdownPanel from "../components/priceBreakeDownPanel";
import DesignStudioPanel from "../components/designStudioPanel";
import { resolveLayers } from "../components/mannequin/layerRegistry";

// Phase 1 — Question Wizard: a handful of quick questions asked one at a
// time (Store Home -> "Start Designing"). Config-driven: each entry just
// points OptionStep at a CustomizationOption group.
const QUIZ_STEPS = [
  { group: "gender", label: "Who is this outfit for?" },
  { group: "ageGroup", label: "Age group" },
  { group: "occasion", label: "What's the occasion?" },
  { group: "dressCategory", label: "Dress category" },
  { group: "clothingType", label: "Choose a clothing type" },
  { group: "fit", label: "Preferred fit" },
];

// Phase 2 — Design Studio: a two-panel layout (left: controls, right: live
// preview + price) that replaces the step-by-step quiz once the basics are
// answered, per the "Design Studio" spec.
const CustomizeWizardPage = () => {
  const navigate = useNavigate();
  const { state, setOption, setMeasurement, setNotes, nextStep, prevStep } = useCustomizationWizard();
  const { saveDesign, submitDesignRequest, isLoading: isSaving } = useMyDesigns();
  const [phase, setPhase] = useState("quiz"); // "quiz" | "studio"
  const [title, setTitle] = useState("");
  const [savedDesignId, setSavedDesignId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

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

  const handleSaveDesign = async () => {
    setSaveMessage("");
    const [previewLayer] = resolveLayers(state.selections);
    const result = await saveDesign({
      title: title.trim() || `${state.selections.clothingType} Design`,
      previewImage: {
        url: previewLayer?.src || previewLayer?.fallbackSrc || "",
        publicId: `${state.selections.clothingType || "design"}-preview`,
      },
      clothingType: state.selections.clothingType,
      selections: state.selections,
      measurements: state.selections.measurements,
      price: price.total,
    });
    if (result.success) {
      setSavedDesignId(result.design._id);
      setSaveMessage("Design saved to My Designs.");
    } else {
      setSaveMessage(result.message);
    }
  };

  const handleSubmitRequest = async () => {
    if (!savedDesignId) return;
    const result = await submitDesignRequest(savedDesignId);
    setSaveMessage(result.success ? "Design request submitted — our team will follow up." : result.message);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {phase === "quiz" ? (
        <div className="mx-auto max-w-lg">
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
              onSelect={(value) => setOption(currentQuizStep.group, value)}
            />
          </StepWizard>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left panel: customization controls */}
          <div className="order-2 md:order-1">
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="mb-4 text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              ← Edit gender / occasion / clothing type
            </button>
            <DesignStudioPanel
              selections={state.selections}
              onSelect={setOption}
              onMeasurementChange={setMeasurement}
              notes={state.additionalRequirements}
              onNotesChange={setNotes}
            />
          </div>

          {/* Right panel: live preview + price */}
          <div className="order-1 md:sticky md:top-6 md:order-2 md:self-start">
            <MannequinCanvas selections={state.selections} />
            <div className="mt-6">
              <PriceBreakdownPanel price={price} isCalculating={isCalculating} />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this design (optional)"
                className="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none"
              />
              <button
                onClick={handleSaveDesign}
                disabled={isSaving || !state.selections.clothingType}
                className="w-full rounded-full bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-40"
              >
                {isSaving ? "Saving..." : "Save My Design"}
              </button>
              {savedDesignId && (
                <button
                  onClick={handleSubmitRequest}
                  className="w-full rounded-full border border-gray-300 py-3 text-sm font-medium text-gray-700"
                >
                  Submit Design Request
                </button>
              )}
              {saveMessage && <p className="text-center text-xs text-gray-500">{saveMessage}</p>}
              <button
                onClick={() => navigate("/designs/saved")}
                className="text-center text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                View My Saved Designs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizeWizardPage;