import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Camera, Save, Check, ShieldCheck } from "lucide-react";
import Sidebar from "../components/sidebar";
import axiosInstance from "../../../shared/api/axiosInstance";
import { updateUserSuccess } from "../../auth/store/authSlice";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImage?.url || "");
  const [signatureColor, setSignatureColor] = useState(user?.signatureColor || "#4a5280");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axiosInstance.put("/users/profile", {
        name: name.trim(),
        profileImage: profileImageUrl,
        signatureColor,
      });

      if (res.data?.user) {
        dispatch(updateUserSuccess(res.data.user));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              My Profile
            </h1>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto px-7 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: "#ede8e0" }}>
            <h2 className="text-xl font-extrabold mb-1" style={{ color: "#1c1c2e" }}>
              Profile Details
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Update your personal details and profile picture.
            </p>

            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {message.type === "success" && <Check size={16} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b" style={{ borderColor: "#ede8e0" }}>
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold border-2 shadow-inner"
                    style={{ backgroundColor: signatureColor, borderColor: "#ede8e0" }}
                  >
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || <UserIcon size={32} />
                    )}
                  </div>
                  <label
                    htmlFor="profile-image-input"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#4a5280] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#3d4467] transition-colors"
                    title="Change Photo"
                  >
                    <Camera size={15} />
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base font-extrabold" style={{ color: "#1c1c2e" }}>
                    {user?.name || "User"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                    <ShieldCheck size={13} className="text-[#4a5280]" />
                    <span>Role: {user?.role || "user"}</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:border-[#4a5280] transition-colors"
                    style={{ borderColor: "#ede8e0" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed"
                    style={{ borderColor: "#ede8e0" }}
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#4a5280" }}
                >
                  <Save size={16} />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
