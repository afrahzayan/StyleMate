import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import useAuth from "../hooks/useAuth";
import GoogleLoginButton from "../components/GoogleLoginButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ───── LEFT: image panel ───── */}
      <div
        className="hidden md:flex w-1/2 relative flex-col justify-end p-10"
        style={{ backgroundColor: "#7a8aaa" }}
      >
        {/* dark gradient from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,20,50,0.88) 0%, rgba(20,20,50,0.15) 65%)",
          }}
        />

        {/* Top-left brand */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white">
          <span className="text-lg">👔</span>
          <div>
            <p className="text-sm font-bold leading-tight">StyleMate</p>
            <p className="text-xs text-gray-300">Virtual Wardrobe</p>
          </div>
        </div>

        {/* Bottom-left text */}
        <div className="relative z-10 text-white">
          <h1 className="text-4xl font-extrabold mb-3">Welcome Back</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
            Step back into your personal style sanctuary and rediscover your
            perfect look.
          </p>
        </div>
      </div>

      {/* ───── RIGHT: form panel ───── */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-14 bg-white">

        {/* Mobile-only logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <span>👔</span>
          <span className="font-bold text-sm" style={{ color: "#4a5280" }}>
            StyleMate
          </span>
        </div>

        <h2 className="text-3xl font-extrabold mb-1" style={{ color: "#1c1c2e" }}>
          Login to your account
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Please enter your details to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email field */}
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

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1c1c2e" }}>
              Password
            </label>
            <div
              className="flex items-center gap-3 border rounded-xl px-4 py-3"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Lock size={16} className="text-gray-400 shrink-0" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}>
                {showPw
                  ? <EyeOff size={15} className="text-gray-400" />
                  : <Eye size={15} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-medium"
              style={{ color: "#4a5280" }}
            >
              Forgot password?
            </button>
          </div>

          {/* Error message */}
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
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1" style={{ borderColor: "#e5e7eb" }} />
          <span className="text-xs text-gray-400 tracking-wider font-medium">
            OR CONTINUE WITH
          </span>
          <hr className="flex-1" style={{ borderColor: "#e5e7eb" }} />
        </div>

        {/* Google button */}
        <GoogleLoginButton />

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-bold"
            style={{ color: "#1c1c2e" }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;