import { ChevronLeft, ChevronRight } from "lucide-react";

// Thin shell: renders whichever step component is passed as children,
// plus Prev/Next controls. Owns no selection state itself — that all lives
// in useCustomizationWizard, one level up.
const StepWizard = ({ stepIndex, totalSteps, onPrev, onNext, canGoNext = true, children }) => (
  <div className="flex flex-col gap-6">
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? "bg-gray-900" : "bg-gray-200"}`} />
      ))}
    </div>

    <div className="min-h-[240px]">{children}</div>

    <div className="flex justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={stepIndex === 0}
        className="flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 disabled:opacity-30"
      >
        <ChevronLeft size={16} /> Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-1 rounded-full bg-gray-900 px-5 py-2 text-sm text-white disabled:opacity-40"
      >
        {stepIndex === totalSteps - 1 ? "Review Design" : "Next"} <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

export default StepWizard;