import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MailCheck, Lock } from "lucide-react";
import useAuth from "../hooks/useAuth";

const VerifyOtpPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { verifyOtp, resendOtp, isLoading } = useAuth();

  // Email was passed from signup page via navigate state
  const email = location.state?.email || "";

  const [digits, setDigits]       = useState(["", "", "", "", "", ""]);
  const [error, setError]         = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setError("");
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits"); return; }

    const result = await verifyOtp(email, otp);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendMsg("");
    setError("");
    const result = await resendOtp(email);
    if (result.success) {
      setResendMsg("New code sent! Check your inbox.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setResendMsg("Failed to resend. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#faf8f5" }}
    >
      {/* ── Top: just the logo ── */}
      <div className="px-8 py-5">
        <button
          onClick={() => navigate("/")}
          className="font-extrabold text-base"
          style={{ color: "#343857" }}
        >
          StyleMate
        </button>
      </div>

      {/* ── Center card ── */}
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div
          className="bg-white rounded-2xl shadow-sm border w-full max-w-sm px-8 py-10"
          style={{ borderColor: "#ede8e0" }}
        >
          {/* Mail icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#eef0f8" }}
            >
              <MailCheck size={24} style={{ color: "#4a5280" }} />
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-center text-2xl font-extrabold mb-2"
            style={{ color: "#343857" }}
          >
            Verify Your Email
          </h1>
          <p className="text-center text-sm text-gray-500 mb-7 leading-relaxed">
            We&apos;ve sent a 6-digit code to your email.
            <br />
            Please enter it below to confirm your account.
          </p>

          {/* 6 digit input boxes */}
          <div className="flex justify-center gap-2.5 mb-6">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all"
                style={{
                  borderColor: digit ? "#4a5280" : "#e5e7eb",
                  backgroundColor: digit ? "#f0f2fa" : "#faf8f5",
                  color: "#1c1c2e",
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs text-center mb-4">{error}</p>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity mb-4"
            style={{ backgroundColor: "#4a5280" }}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          {/* Divider line */}
          <hr style={{ borderColor: "#ede8e0" }} />

          {/* Resend code */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              className="font-semibold"
              style={{ color: "#4a5280" }}
            >
              Resend code
            </button>
          </p>

          {resendMsg && (
            <p className="text-center text-xs mt-2 text-green-600">{resendMsg}</p>
          )}

          {/* Secure verification note */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <Lock size={11} className="text-gray-400" />
            <span className="text-xs tracking-widest font-medium text-gray-400">
              SECURE VERIFICATION
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between px-8 py-4 text-xs text-gray-400 border-t" style={{ borderColor: "#ede8e0" }}>
        <span>© 2024 StyleMate Digital Boutique. All rights reserved.</span>
        <div className="flex gap-4">
          <button className="hover:text-gray-600">Support</button>
          <button className="hover:text-gray-600">Privacy</button>
          <button className="hover:text-gray-600">Terms</button>
        </div>
      </footer>
    </div>
  );
};

export default VerifyOtpPage;
