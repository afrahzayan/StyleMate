import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Download, Send, Trash2, Scissors } from "lucide-react";
import Sidebar from "../../user/components/sidebar";
import useMyDesigns from "../hooks/useMyDesigns";
import { downloadDesignSummary } from "../utils/downloadDesignSummary";

const MyDesignsPage = ({ view = "saved" }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { fetchMyDesigns, submitDesignRequest, deleteDesign, isLoading } = useMyDesigns();
  const [designs, setDesigns] = useState([]);

  const load = async () => {
    const result = await fetchMyDesigns(view === "saved" ? "saved" : undefined);
    if (result.success) setDesigns(result.designs);
  };

  useEffect(() => {
    load();
  }, [view]);

  const handleShare = async (design) => {
    const shareUrl = `${window.location.origin}/customize?design=${design._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Design link copied to clipboard!");
    } catch {
      alert(shareUrl);
    }
  };

  const handleSubmit = async (design) => {
    const result = await submitDesignRequest(design._id);
    if (result.success) load();
  };

  const handleDelete = async (design) => {
    if (!window.confirm("Delete this design?")) return;
    const result = await deleteDesign(design._id);
    if (result.success) load();
  };

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
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
              {view === "saved" ? "Saved Custom Designs" : "Design History"}
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
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-7 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/designs/saved")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  view === "saved"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                Saved Designs
              </button>
              <button
                onClick={() => navigate("/designs/history")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  view === "history"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                History
              </button>
            </div>

            <button
              onClick={() => navigate("/customize/new")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#4a5280] text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <Scissors size={14} />
              New Design
            </button>
          </div>

          {isLoading && <p className="text-xs text-gray-400">Loading your designs...</p>}

          {!isLoading && designs.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "#ede8e0" }}>
              <p className="text-sm font-semibold text-gray-600 mb-4">
                {view === "saved" ? "You haven't saved any custom designs yet." : "No design history found."}
              </p>
              <button
                onClick={() => navigate("/customize/new")}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow"
                style={{ backgroundColor: "#4a5280" }}
              >
                Start Designing Now
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <div
                key={design._id}
                className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md"
                style={{ borderColor: "#ede8e0" }}
              >
                <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                  <img
                    src={design.previewImage?.url}
                    alt={design.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-700 shadow-sm border border-gray-200">
                    {design.status}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-extrabold" style={{ color: "#1c1c2e" }}>
                      {design.title}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-[#4a5280]">Est. ₹{design.price}</p>
                  <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "#ede8e0" }}>
                    <button
                      onClick={() => downloadDesignSummary(design)}
                      className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Download size={13} /> Summary
                    </button>
                    <button
                      onClick={() => handleShare(design)}
                      className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Share2 size={13} /> Share
                    </button>
                    {design.status === "saved" && (
                      <button
                        onClick={() => handleSubmit(design)}
                        className="flex items-center gap-1 rounded-xl bg-[#4a5280] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                      >
                        <Send size={13} /> Submit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(design)}
                      className="flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 ml-auto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyDesignsPage;