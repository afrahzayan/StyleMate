import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import useCustomizationOptions from "../hooks/useCustomizationOptions";

const CustomizationHomePage = () => {
  const { fetchPopularDesigns } = useCustomizationOptions();
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    fetchPopularDesigns().then((r) => r.success && setDesigns(r.designs));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-14 flex flex-col items-center gap-5 rounded-3xl bg-gray-900 px-8 py-16 text-center text-white">
        <h1 className="text-3xl font-semibold sm:text-4xl">Design Your Dream Outfit</h1>
        <p className="max-w-lg text-sm text-gray-300">
          Answer a few questions about what you want, watch it take shape on a live preview, and see the
          price update as you go.
        </p>
        <Link to="/customize/new" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900">
          Start Customizing
        </Link>
      </section>

      {designs.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Popular Customized Dresses</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {designs.map((d) => (
              <div key={d._id} className="overflow-hidden rounded-2xl border border-gray-100">
                <div className="aspect-[3/4] bg-gray-50">
                  <img src={d.previewImage?.url} alt={d.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">{d.title}</h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold">₹{d.price}</span>
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={12} fill="currentColor" /> {d.ratingAvg?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CustomizationHomePage;