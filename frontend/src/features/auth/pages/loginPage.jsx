import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import useAuth from "../hooks/useAuth";
import AuthNavbar from "../components/authNavbar";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email || !password) { setFormError("Please fill in all fields"); return; }

    const result = await login(email, password);
    if (result.success) navigate("/dashboard");
    else setFormError(result.message);
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
            style={{ backgroundColor: "#4a5280", width: "35%", minHeight: "460px" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(10,10,30,0.75) 0%, rgba(10,10,30,0.1) 70%)" }}
            />
            <div className="relative z-10">
              <p className="text-white font-extrabold text-xl leading-snug mb-2">Welcome Back</p>
              <p className="text-xs leading-relaxed" style={{ color: "#b0b8d8" }}>
                Step back into your personal style sanctuary and rediscover your perfect look.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-9">
            <h2 className="text-xl font-extrabold mb-0.5" style={{ color: "#1c1c2e" }}>
              Login to your account
            </h2>
            <p className="text-gray-400 text-xs mb-6">Please enter your details to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Email address
                </label>
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

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Password
                </label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: "#e5e7eb" }}>
                  <Lock size={14} className="text-gray-400 shrink-0" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs font-medium" style={{ color: "#4a5280" }}>
                  Forgot password?
                </button>
              </div>

              {(formError || error) && (
                <p className="text-red-500 text-xs">{formError || error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#4a5280" }}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              Don&apos;t have an account?{" "}
              <button onClick={() => navigate("/signup")} className="font-bold" style={{ color: "#1c1c2e" }}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
