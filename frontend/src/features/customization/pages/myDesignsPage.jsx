import { useEffect, useState } from "react";
import { Share2, Download, Send, Trash2 } from "lucide-react";
import useMyDesigns from "../hooks/useMyDesigns";
import { downloadDesignSummary } from "../utils/downloadDesignSummary";

// view: "saved" shows only designs not yet submitted; "history" shows every
// design the user has ever saved, including submitted ones.
const MyDesignsPage = ({ view = "saved" }) => {
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        {view === "saved" ? "Saved Designs" : "Design History"}
      </h1>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

      {!isLoading && designs.length === 0 && (
        <p className="text-sm text-gray-500">
          {view === "saved" ? "You haven't saved any designs yet." : "No designs in your history yet."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => (
          <div key={design._id} className="overflow-hidden rounded-2xl border border-gray-100">
            <div className="aspect-[3/4] bg-gray-50">
              <img src={design.previewImage?.url} alt={design.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-sm font-medium text-gray-900">{design.title}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                  {design.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Est. ₹{design.price}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => downloadDesignSummary(design)}
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700"
                >
                  <Download size={13} /> Summary
                </button>
                <button
                  onClick={() => handleShare(design)}
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700"
                >
                  <Share2 size={13} /> Share
                </button>
                {design.status === "saved" && (
                  <button
                    onClick={() => handleSubmit(design)}
                    className="flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    <Send size={13} /> Submit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(design)}
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-rose-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyDesignsPage;