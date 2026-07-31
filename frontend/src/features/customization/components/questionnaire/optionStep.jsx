import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import useCustomizationOptions from "../../hooks/useCustomizationOptions";
import { buildLayerUrl } from "../../utils/cloudinaryLayer";

// One generic component renders every questionnaire question (gender,
// occasion, fit, sleeve, neck, material, pattern, embroidery, pocket,
// buttons...) by fetching its option group from the backend catalog. Adding
// a brand-new question to the questionnaire is a backend CustomizationOption
// seed entry, not a new React component.
//
// Cards render an image when the option has an `imagePublicId` (Cloudinary
// public_id, e.g. "StyleMate/onboarding/gender/male"). Options without one
// (fit, dress category, etc.) fall back to a clean text-only pill so the
// same component still looks intentional either way.
const OptionStep = ({ group, label, value, onSelect, layout = "grid" }) => {
  const { fetchOptions } = useCustomizationOptions();
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "empty" | "error"

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchOptions(group).then((r) => {
      if (cancelled) return;
      if (!r.success) {
        setStatus("error");
        return;
      }
      setOptions(r.options);
      setStatus(r.options.length === 0 ? "empty" : "ready");
    });
    return () => {
      cancelled = true;
    };
  }, [group]);

  if (status === "loading") {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{label}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{label}</h2>
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Couldn't load options for this step. Check that the backend server is running and reachable.
        </p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{label}</h2>
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No "{group}" options found yet. Seed the catalog by running{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5">node backend/scripts/seedCustomizationOptions.js</code>{" "}
          from the project root.
        </p>
      </div>
    );
  }

  const hasImages = options.some((opt) => opt.imagePublicId);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{label}</h2>

      {hasImages ? (
        <div className={layout === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "flex flex-wrap gap-3"}>
          {options.map((opt) => (
            <ImageOptionCard
              key={opt._id}
              option={opt}
              selected={value === opt.value}
              onSelect={() => onSelect(opt.value)}
            />
          ))}
        </div>
      ) : (
        <div className={layout === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "flex flex-wrap gap-2"}>
          {options.map((opt) => (
            <button
              key={opt._id}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                value === opt.value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              <span>
                {opt.label}
                {opt.priceModifier > 0 && (
                  <span className={`ml-1 text-xs ${value === opt.value ? "text-gray-300" : "text-gray-400"}`}>
                    +₹{opt.priceModifier}
                  </span>
                )}
              </span>
              {opt.description && (
                <span className={`block text-xs ${value === opt.value ? "text-gray-300" : "text-gray-400"}`}>
                  {opt.description}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Selection card: Cloudinary image on top, label below, hover lift, and a
// checked badge + ring when selected. Falls back to an initial-letter tile
// if the option has no imagePublicId yet, or if the image 404s (e.g. the
// PNG hasn't been uploaded to Cloudinary yet) — so a missing asset never
// breaks the layout.
const ImageOptionCard = ({ option, selected, onSelect }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = option.imagePublicId ? buildLayerUrl(option.imagePublicId, { width: 400 }) : null;
  const showImage = url && !imgFailed;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "border-gray-900 shadow-md ring-2 ring-gray-900" : "border-gray-200"
      }`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50">
        {showImage ? (
          <img
            src={url}
            alt={option.label}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-3xl font-semibold text-gray-400">
            {option.label?.charAt(0)}
          </div>
        )}
      </div>

      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white shadow">
          <Check size={14} />
        </span>
      )}

      <div className="flex flex-col gap-0.5 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${selected ? "text-gray-900" : "text-gray-700"}`}>
            {option.label}
          </span>
          {option.priceModifier > 0 && <span className="text-xs text-gray-400">+₹{option.priceModifier}</span>}
        </div>
        {option.description && <span className="text-xs text-gray-400">{option.description}</span>}
      </div>
    </button>
  );
};

export default OptionStep;