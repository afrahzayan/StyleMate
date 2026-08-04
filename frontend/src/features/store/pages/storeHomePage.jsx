import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sparkles, Scissors, Layers, Shirt } from "lucide-react";
import Sidebar from "../../user/components/sidebar";
import useDesignGallery from "../hooks/useDesignGallery";
import DesignGrid from "../components/designGrid";

const StoreHomePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { fetchRecentDesigns, fetchCategories, isLoading } = useDesignGallery();
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const [recentResult, categoriesResult] = await Promise.all([
        fetchRecentDesigns(8),
        fetchCategories(),
      ]);
      if (recentResult.success) setRecent(recentResult.designs);
      if (categoriesResult.success) setCategories(categoriesResult.categories);
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
              Custom Design Studio
            </h1>
          </div>
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
            <span className="text-xs font-bold hidden sm:inline" style={{ color: "#1c1c2e" }}>
              {user?.name || "Profile"}
            </span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-7 py-6">
          {/* Hero Banner */}
          <section
            className="mb-8 overflow-hidden rounded-2xl p-8 text-white relative shadow-sm"
            style={{ backgroundColor: "#3d4467" }}
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-4 text-[#b0b8d8]">
                <Sparkles size={14} className="text-amber-300" />
                <span>StyleMate Dress Studio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
                Customize Your Own Dress
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: "#b0b8d8" }}>
                Select your fabric, fit, sleeve, embroidery, and color shade. Watch your unique outfit take shape on a live preview with instant price estimation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/customize/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white transition-all hover:bg-gray-50 shadow"
                  style={{ color: "#3d4467" }}
                >
                  <Scissors size={15} />
                  Start Customizing
                </Link>
                <Link
                  to="/designs/saved"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all text-white hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}
                >
                  <Layers size={15} />
                  My Saved Designs
                </Link>
              </div>
            </div>
          </section>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="mb-8">
              <h3 className="text-base font-extrabold mb-3" style={{ color: "#1c1c2e" }}>
                Clothing Categories
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {categories.map((c) => (
                  <button
                    key={c.clothingType}
                    onClick={() => navigate("/customize/new")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border bg-white transition-colors hover:border-[#4a5280]"
                    style={{ borderColor: "#ede8e0", color: "#374151" }}
                  >
                    <Shirt size={14} style={{ color: "#4a5280" }} />
                    {c.clothingType}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Recent Designs */}
          <section className="mb-8">
            <h3 className="text-base font-extrabold mb-4" style={{ color: "#1c1c2e" }}>
              Recently Designed Dresses
            </h3>
            <DesignGrid
              designs={recent}
              isLoading={isLoading}
              emptyMessage="No recent customer designs available."
            />
          </section>

          {/* CTA Box */}
          <section
            className="mb-6 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border"
            style={{ backgroundColor: "#ffffff", borderColor: "#ede8e0" }}
          >
            <div>
              <h3 className="text-lg font-extrabold mb-1" style={{ color: "#1c1c2e" }}>
                Ready to Design Your Outfit?
              </h3>
              <p className="text-xs text-gray-500 max-w-md">
                Answer basic onboarding questions and enter our live 2D Design Studio with layer-based previews.
              </p>
            </div>
            <Link
              to="/customize/new"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shrink-0 shadow"
              style={{ backgroundColor: "#4a5280" }}
            >
              Start Designing Now
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StoreHomePage;