import { useState } from "react";
import { Star } from "lucide-react";
import { getClothingTypeImageUrl } from "../../customization/utils/cloudinaryLayer";

const DesignCard = ({ design }) => {
  const fallbackUrl = getClothingTypeImageUrl(design.clothingType);
  const initialUrl =
    design.previewImage?.url && !design.previewImage.url.includes("custom-design/final")
      ? design.previewImage.url
      : fallbackUrl;

  const [imgSrc, setImgSrc] = useState(initialUrl);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
      <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
        <img
          src={imgSrc}
          alt={design.title || "Custom Design"}
          onError={() => setImgSrc(fallbackUrl)}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-gray-900">{design.title}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-semibold">Est. ₹{design.price}</span>
          {design.ratingAvg > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-bold">
              <Star size={12} fill="currentColor" /> {design.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignCard;