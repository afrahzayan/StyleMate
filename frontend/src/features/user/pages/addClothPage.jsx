import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, Camera, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import useWardrobe from "../hooks/useWardrobe";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AddClothPage = () => {
  const navigate = useNavigate();
  const { addCloth } = useWardrobe();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleFileInputChange = (e) => validateAndSetFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }
    setIsAnalyzing(true);
    const result = await addCloth(file);
    setIsAnalyzing(false);

    if (result.success) {
      toast.success("Item added to your wardrobe");
      navigate(`/wardrobe/${result.cloth._id}`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center gap-4 px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
          </button>
          <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
            Add New Cloth
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto px-7 py-8">
          <div className="max-w-xl">
            <h2 className="text-xl font-extrabold mb-1" style={{ color: "#1c1c2e" }}>
              Add New Cloth
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Upload a photo and our AI will fill in the details for you.
            </p>

            {!previewUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-16 cursor-pointer transition-colors"
                style={{
                  borderColor: isDragging ? "#4a5280" : "#e8b4b8",
                  backgroundColor: isDragging ? "#f0f2fa" : "#f5f2ec",
                }}
              >
                <UploadCloud size={28} style={{ color: "#4a5280" }} />
                <p className="text-sm font-semibold" style={{ color: "#1c1c2e" }}>
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-300">or</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border"
                  style={{ borderColor: "#e5e7eb", color: "#374151" }}
                >
                  <Camera size={14} />
                  Use Camera
                </button>

                {/* Standard file picker */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                {/* Camera capture — capture="environment" opens the rear camera
                    directly on supporting mobile browsers */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div
                className="rounded-2xl border overflow-hidden relative"
                style={{ borderColor: "#ede8e0" }}
              >
                <img src={previewUrl} alt="Preview" className="w-full max-h-96 object-contain bg-white" />
                {!isAnalyzing && (
                  <button
                    onClick={clearFile}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    <X size={15} className="text-gray-500" />
                  </button>
                )}
              </div>
            )}

            {previewUrl && (
              <button
                onClick={handleUpload}
                disabled={isAnalyzing}
                className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundColor: "#4a5280" }}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles size={16} className="animate-pulse" />
                    Analyzing with AI... this can take up to 15 seconds
                  </>
                ) : (
                  "Upload & Analyze"
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddClothPage;