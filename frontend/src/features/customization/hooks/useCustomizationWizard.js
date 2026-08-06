import { useReducer } from "react";

const initialState = {
  step: 0,
  // Question Wizard fields
  selections: {
    gender: null,
    ageGroup: null,
    occasion: null,
    dressCategory: null,
    clothingType: null,
    fit: null,
    // Design Studio fields (live, edited in the two-panel layout)
    fabric: null,
    color: null,
    sleeveType: null,
    neckType: null,
    length: null,
    pattern: null,
    embroidery: null,
    threadWork: null,
    stoneWork: null,
    // Free-form body measurements (cm) — not priced per-field, see
    // priceEngineService's flat customMeasurementFee.
    measurements: {
      height: "",
      shoulder: "",
      chest: "",
      waist: "",
      hip: "",
      sleeveLength: "",
    },
  },
  budget: null,
  referenceImage: null,
  additionalRequirements: "",
};

// Every action patches exactly one field (or advances the step). Nothing
// ever spreads a "reset" over the whole selections object, which is what
// guarantees changing one option never resets the others.
function reducer(state, action) {
  switch (action.type) {
    case "SET_OPTION":
      return {
        ...state,
        lastSelected: { group: action.group, value: action.value },
        selections: { ...state.selections, [action.group]: action.value },
      };
    case "SET_MEASUREMENT":
      return {
        ...state,
        selections: {
          ...state.selections,
          measurements: { ...state.selections.measurements, [action.field]: action.value },
        },
      };
    case "SET_BUDGET":
      return { ...state, budget: action.value };
    case "SET_REFERENCE_IMAGE":
      return { ...state, referenceImage: action.value };
    case "SET_NOTES":
      return { ...state, additionalRequirements: action.value };
    case "NEXT_STEP":
      return { ...state, step: state.step + 1 };
    case "PREV_STEP":
      return { ...state, step: Math.max(0, state.step - 1) };
    case "GO_TO_STEP":
      return { ...state, step: action.step };
    case "APPLY_AI_RECOMMENDATION":
      // AI proposes, user disposes — still fully editable after this.
      return { ...state, selections: { ...state.selections, ...action.selections } };
    case "LOAD_SAVED_SELECTIONS":
      return {
        ...state,
        selections: { ...state.selections, ...action.selections },
      };
    default:
      return state;
  }
}

const useCustomizationWizard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setOption = (group, value) => dispatch({ type: "SET_OPTION", group, value });
  const setMeasurement = (field, value) => dispatch({ type: "SET_MEASUREMENT", field, value });
  const setBudget = (value) => dispatch({ type: "SET_BUDGET", value });
  const setReferenceImage = (value) => dispatch({ type: "SET_REFERENCE_IMAGE", value });
  const setNotes = (value) => dispatch({ type: "SET_NOTES", value });
  const nextStep = () => dispatch({ type: "NEXT_STEP" });
  const prevStep = () => dispatch({ type: "PREV_STEP" });
  const goToStep = (step) => dispatch({ type: "GO_TO_STEP", step });
  const applyAiRecommendation = (selections) => dispatch({ type: "APPLY_AI_RECOMMENDATION", selections });
  const loadSavedSelections = (selections) => dispatch({ type: "LOAD_SAVED_SELECTIONS", selections });

  return {
    state,
    setOption,
    setMeasurement,
    setBudget,
    setReferenceImage,
    setNotes,
    nextStep,
    prevStep,
    goToStep,
    applyAiRecommendation,
    loadSavedSelections,
  };
};

export default useCustomizationWizard;