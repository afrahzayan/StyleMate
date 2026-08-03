import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import useCustomizationOptions from "../../hooks/useCustomizationOptions";
import { buildLayerUrl, slugify } from "../../utils/cloudinaryLayer";

export const COLOR_HEX_MAP = {
  "pure-white": "#ffffff",
  "classic-black": "#18181b",
  "light-blue": "#93c5fd",
  "royal-blue": "#2563eb",
  "navy-blue": "#1e3a8a",
  "pastel-red": "#fca5a5",
  "crimson-red": "#dc2626",
  "normal-red": "#ef4444",
  "dark-red": "#7f1d1d",
  "pastel-green": "#86efac",
  "emerald-green": "#10b981",
  "normal-green": "#22c55e",
  "dark-green": "#14532d",
  "sunny-yellow": "#fde047",
  "soft-pink": "#f472b6",
  "royal-purple": "#c084fc",
  "metallic-gold": "#fbbf24",
  "slate-gray": "#64748b",
  white: "#ffffff",
  black: "#18181b",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#10b981",
  yellow: "#fde047",
  pink: "#f472b6",
  purple: "#c084fc",
  gold: "#fbbf24",
};

export const getHexForOption = (opt) => {
  if (typeof opt === "string") {
    const slug = slugify(opt);
    return COLOR_HEX_MAP[slug] || "#2563eb";
  }
  if (opt?.hex) return opt.hex;
  const slug = slugify(opt?.value || opt?.label || "");
  return COLOR_HEX_MAP[slug] || "#2563eb";
};

const OptionStep = ({ group, label, value, onSelect, gender, layout = "grid" }) => {
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

      let list = r.options || [];

      // Gender-based filtering for clothingType
      if (group === "clothingType" && gender) {
        const targetGender = String(gender).trim();
        if (targetGender === "Men") {
          list = list.filter((o) => {
            const comps = o.compatibleWith || [];
            return comps.length === 0 || comps.includes("Men") || comps.includes("Unisex");
          });
        } else if (targetGender === "Women") {
          list = list.filter((o) => {
            const comps = o.compatibleWith || [];
            return comps.length === 0 || comps.includes("Women") || comps.includes("Unisex");
          });
        } else if (targetGender === "Unisex") {
          list = list.filter((o) => {
            const comps = o.compatibleWith || [];
            return comps.length === 0 || comps.includes("Unisex") || comps.includes("Men") || comps.includes("Women");
          });
        }
      }

      setOptions(list);
      setStatus(list.length === 0 ? "empty" : "ready");
    });
    return () => {
      cancelled = true;
    };
  }, [group, gender]);

  if (status === "loading") {
    return (
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900">{label}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900">{label}</h2>
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Couldn't load options for this step.
        </p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900">{label}</h2>
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No "{group}" options found yet.
        </p>
      </div>
    );
  }

  const isColorGroup = group === "color";
  const hasImages = !isColorGroup && options.some((opt) => opt.imagePublicId);

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-gray-900">{label}</h2>

      {isColorGroup ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {options.map((opt) => {
            const hex = getHexForOption(opt);
            const isSelected = value === opt.value;
            const isWhite = hex === "#ffffff";

            return (
              <button
                key={opt._id}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#4a5280] bg-[#f0f2fa] ring-2 ring-[#4a5280]/20 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0 border border-black/15 shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && (
                    <Check size={14} className={isWhite ? "text-gray-900" : "text-white"} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 truncate">{opt.label || opt.value}</p>
                  {opt.priceModifier > 0 && (
                    <p className="text-[11px] text-gray-500">+₹{opt.priceModifier}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : hasImages ? (
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
        <div className={layout === "grid" ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3" : "flex flex-wrap gap-2"}>
          {options.map((opt) => (
            <button
              key={opt._id}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                value === opt.value
                  ? "border-[#4a5280] bg-[#4a5280] text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt.label || opt.value}</span>
                {opt.priceModifier > 0 && (
                  <span className={`ml-1 text-[11px] ${value === opt.value ? "text-gray-200" : "text-gray-500"}`}>
                    +₹{opt.priceModifier}
                  </span>
                )}
              </div>
              {opt.description && (
                <span className={`block text-[10px] mt-0.5 ${value === opt.value ? "text-gray-200" : "text-gray-400"}`}>
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

const ImageOptionCard = ({ option, selected, onSelect }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = option.imagePublicId ? buildLayerUrl(option.imagePublicId, { width: 400 }) : null;
  const showImage = url && !imgFailed;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-[#4a5280] ring-2 ring-[#4a5280]/20 shadow-sm" : "border-gray-200"
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-2xl font-bold text-gray-400">
            {option.label?.charAt(0)}
          </div>
        )}
      </div>

      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#4a5280] text-white shadow">
          <Check size={14} />
        </span>
      )}

      <div className="flex flex-col gap-0.5 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${selected ? "text-[#1c1c2e]" : "text-gray-700"}`}>
            {option.label}
          </span>
          {option.priceModifier > 0 && <span className="text-[11px] text-gray-500">+₹{option.priceModifier}</span>}
        </div>
        {option.description && <span className="text-[10px] text-gray-400">{option.description}</span>}
      </div>
    </button>
  );
};

export default OptionStep;