import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import useAuth from "../hooks/useAuth";
import OtpModal from "../components/OtpModal";
import GoogleLoginButton from "../components/GoogleLoginButton";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formError, setFormError] = useState("");

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  // Toast shown briefly after OTP is sent
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!name || !email || !password || !confirmPw) {
      setFormError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPw) {
      setFormError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setFormError("Please agree to the Terms of Service");
      return;
    }

    const result = await register(name, email, password);

    if (result.success) {
      // Show success toast for 2 seconds, then open OTP modal
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setShowOtpModal(true);
      }, 2000);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* ───── LEFT: image card ───── */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center p-10"
        style={{ backgroundColor: "#faf8f5" }}
      >
        <div
          className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-xl flex items-end"
          style={{ backgroundColor: "#b8a48a", minHeight: "420px" }}
        >
          {/* gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(20,15,5,0.75) 0%, rgba(0,0,0,0.05) 60%)",
            }}
          />
          <div className="relative z-10 text-white p-7 pb-9">
            <h2 className="text-3xl font-extrabold mb-2">Create Account</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Join us and organise your wardrobe with our digital boutique.
            </p>
          </div>
        </div>
      </div>

      {/* ───── RIGHT: form panel ───── */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-14 bg-white py-10">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span>👔</span>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: "#4a5280" }}>
              StyleMate
            </p>
            <p className="text-xs text-gray-400">Virtual Wardrobe</p>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold mb-1" style={{ color: "#1c1c2e" }}>
          Sign up for StyleMate
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Start your digital style journey today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1c1c2e" }}>
              Full Name
            </label>
            <div
              className="flex items-center gap-3 border rounded-xl px-4 py-3"
              style={{ borderColor: "#e5e7eb" }}
            >
              <User size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1c1c2e" }}>
              Email address
            </label>
            <div
              className="flex items-center gap-3 border rounded-xl px-4 py-3"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Mail size={16} className="text-gray-400 shrink-0" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Password + Confirm side by side */}
          <div className="flex gap-3">

            {/* Password */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: "#1c1c2e" }}>
                Password
              </label>
              <div
                className="flex items-center gap-2 border rounded-xl px-3 py-3"
                style={{ borderColor: "#e5e7eb" }}
              >
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent w-0"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw
                    ? <EyeOff size={14} className="text-gray-400" />
                    : <Eye size={14} className="text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: "#1c1c2e" }}>
                Confirm Password
              </label>
              <div
                className="flex items-center gap-2 border rounded-xl px-3 py-3"
                style={{ borderColor: "#e5e7eb" }}
              >
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent w-0"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                  {showConfirmPw
                    ? <EyeOff size={14} className="text-gray-400" />
                    : <Eye size={14} className="text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
              style={{ accentColor: "#4a5280" }}
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="font-semibold" style={{ color: "#4a5280" }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold" style={{ color: "#4a5280" }}>
                Privacy Policy
              </span>
            </span>
          </label>

          {/* Error */}
          {(formError || error) && (
            <p className="text-red-500 text-sm">{formError || error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4a5280" }}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1" style={{ borderColor: "#e5e7eb" }} />
          <span className="text-xs text-gray-400 tracking-wider font-medium">
            OR CONTINUE WITH
          </span>
          <hr className="flex-1" style={{ borderColor: "#e5e7eb" }} />
        </div>

        {/* Google */}
        <GoogleLoginButton />

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-bold"
            style={{ color: "#1c1c2e" }}
          >
            Login
          </button>
        </p>
      </div>

      {/* ───── TOAST: shown for 2s after OTP is sent ───── */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-6 py-4">
          <span className="text-2xl">📬</span>
          <div>
            <p className="font-semibold text-green-700 text-sm">
              OTP sent successfully!
            </p>
            <p className="text-green-600 text-xs">
              Check your inbox for the 6-digit code
            </p>
          </div>
        </div>
      )}

      {/* ───── OTP MODAL ───── */}
      {showOtpModal && (
        <OtpModal email={email} onClose={() => setShowOtpModal(false)} />
      )}
    </div>
  );
};

export default SignupPage;