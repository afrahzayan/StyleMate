import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useDesignGallery from "../hooks/useDesignGallery";
import DesignGrid from "../components/designGrid";

// Store Home — a pure Custom Clothing Design Studio landing page. There is
// nothing for sale here: every section either showcases designs or leads
// into the "Design Your Own Dress" wizard.
const StoreHomePage = () => {
  const { fetchFeaturedDesigns, fetchRecentDesigns, fetchCategories, isLoading } = useDesignGallery();
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const [featuredResult, recentResult, categoriesResult] = await Promise.all([
        fetchFeaturedDesigns(8),
        fetchRecentDesigns(8),
        fetchCategories(),
      ]);
      if (featuredResult.success) setFeatured(featuredResult.designs);
      if (recentResult.success) setRecent(recentResult.designs);
      if (categoriesResult.success) setCategories(categoriesResult.categories);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 px-8 py-16 text-white">
        <h1 className="max-w-xl text-3xl font-semibold sm:text-4xl">Design an Outfit That's Entirely Yours</h1>
        <p className="mt-3 max-w-md text-sm text-gray-300">
          Choose fabric, fit, sleeve, embroidery, and color, watch it take shape on a live preview, and see
          your estimated price update as you go — no buying, no selling, just your design.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/customize/new" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-900">
            Start Designing
          </Link>
          <Link to="/customize" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium">
            AI Design Inspiration
          </Link>
        </div>
      </section>

      {/* Custom Design Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Custom Design Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.clothingType}
                to="/customize/new"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
              >
                {c.clothingType}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Custom Designs */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Featured Custom Designs</h2>
          <Link to="/customize" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            AI Design Inspiration <ArrowRight size={14} />
          </Link>
        </div>
        <DesignGrid designs={featured} isLoading={isLoading} emptyMessage="No featured designs yet — be the first to design one!" />
      </section>

      {/* Recently Designed Dresses / Customer Gallery */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recently Designed Dresses</h2>
        <DesignGrid designs={recent} isLoading={isLoading} emptyMessage="No designs yet." />
      </section>

      {/* Design Your Own Dress CTA */}
      <section className="mb-12 flex flex-col items-center gap-6 rounded-3xl bg-rose-50 px-8 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Design Your Dream Outfit</h2>
        <p className="max-w-lg text-sm text-gray-600">
          Pick your fit, fabric, sleeve, embroidery, and color — watch it come together on a live preview,
          with the estimated price updating as you go.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/customize/new" className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white">
            Design Your Own Dress
          </Link>
          <Link to="/designs/saved" className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700">
            My Saved Designs
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StoreHomePage;