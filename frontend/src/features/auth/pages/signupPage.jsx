import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import useAuth from "../hooks/useAuth";
import AuthNavbar from "../components/authNavbar";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showCPw, setShowCPw]       = useState(false);
  const [agreed, setAgreed]         = useState(false);
  const [formError, setFormError]   = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password || !confirmPw) { setFormError("Please fill in all fields"); return; }
    if (password.length < 6)  { setFormError("Password must be at least 6 characters"); return; }
    if (password !== confirmPw) { setFormError("Passwords do not match"); return; }
    if (!agreed) { setFormError("Please agree to the Terms of Service"); return; }

    const result = await register(name, email, password);
    if (result.success) {
      navigate("/verify-otp", { state: { email } });
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#faf8f5" }}>

      <AuthNavbar />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div
          className="flex w-full max-w-3xl bg-white rounded-2xl shadow-sm overflow-hidden border"
          style={{ borderColor: "#ede8e0" }}
        >
          <div
            className="hidden md:flex flex-col justify-end p-8 relative"
            style={{ backgroundColor: "#6b5b8a", width: "35%", minHeight: "520px" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(20,10,40,0.75) 0%, rgba(20,10,40,0.1) 70%)" }}
            />
            <div className="relative z-10">
              <p className="text-white font-extrabold text-xl leading-snug mb-2">Create Account</p>
              <p className="text-xs leading-relaxed" style={{ color: "#c8bcdc" }}>
                Join us and organise your wardrobe with our digital boutique.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-9">
            <h2 className="text-xl font-extrabold mb-0.5" style={{ color: "#1c1c2e" }}>
              Sign up for StyleMate
            </h2>
            <p className="text-gray-400 text-xs mb-5">Start your digital style journey today.</p>

            <form onSubmit={handleSendOtp} className="space-y-3.5">

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Full Name</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: "#e5e7eb" }}>
                  <User size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Email address</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: "#e5e7eb" }}>
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Password</label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: "#e5e7eb" }}>
                    <Lock size={13} className="text-gray-400 shrink-0" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 outline-none text-sm bg-transparent w-0"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={13} className="text-gray-400" /> : <Eye size={13} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Confirm Password</label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: "#e5e7eb" }}>
                    <Lock size={13} className="text-gray-400 shrink-0" />
                    <input
                      type={showCPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="flex-1 outline-none text-sm bg-transparent w-0"
                    />
                    <button type="button" onClick={() => setShowCPw(!showCPw)}>
                      {showCPw ? <EyeOff size={13} className="text-gray-400" /> : <Eye size={13} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 shrink-0"
                  style={{ accentColor: "#4a5280" }}
                />
                <span className="text-xs text-gray-500">
                  I agree to the{" "}
                  <span className="font-semibold" style={{ color: "#4a5280" }}>Terms of Service</span>
                  {" "}and{" "}
                  <span className="font-semibold" style={{ color: "#4a5280" }}>Privacy Policy</span>
                </span>
              </label>

              {(formError || error) && (
                <p className="text-red-500 text-xs">{formError || error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#4a5280" }}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="font-bold" style={{ color: "#1c1c2e" }}>
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
