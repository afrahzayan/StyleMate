import { Star } from "lucide-react";

const DesignCard = ({ design }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100">
    <div className="aspect-[3/4] bg-gray-50">
      <img src={design.previewImage?.url} alt={design.title} className="h-full w-full object-cover" />
    </div>
    <div className="p-3">
      <h3 className="truncate text-sm font-medium text-gray-900">{design.title}</h3>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-500">Est. ₹{design.price}</span>
        {design.ratingAvg > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <Star size={12} fill="currentColor" /> {design.ratingAvg.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default DesignCard;