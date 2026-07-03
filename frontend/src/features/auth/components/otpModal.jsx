import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const OtpModal = ({ email, onClose }) => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, isLoading } = useAuth();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  // We use refs to move focus between boxes automatically
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Only allow single digit numbers
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);

    // Auto-move to next box when a digit is typed
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back to previous box on backspace if current box is empty
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setError("");
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    const result = await verifyOtp(email, otp);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
      // Clear boxes on wrong OTP
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    }
  };

  const handleResend = async () => {
    setResendMsg("");
    setError("");
    const result = await resendOtp(email);
    if (result.success) {
      setResendMsg("New OTP sent! Check your inbox.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } else {
      setResendMsg("Failed to resend. Please try again.");
    }
  };

  return (
    // Dark overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">

        {/* Icon + heading */}
        <div className="text-center mb-7">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
            style={{ backgroundColor: "#eef0f8" }}
          >
            📧
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "#1c1c2e" }}>
            Verify your email
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        {/* 6 digit input boxes */}
        <div className="flex justify-center gap-3 mb-6">
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
              className="w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
              style={{
                borderColor: digit ? "#4a5280" : "#e5e7eb",
                backgroundColor: digit ? "#f0f2fa" : "#fff",
                color: "#1c1c2e",
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm mb-3"
          style={{ backgroundColor: "#4a5280" }}
        >
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </button>

        {/* Resend */}
        <div className="text-center">
          <span className="text-sm text-gray-500">Didn&apos;t receive it? </span>
          <button
            onClick={handleResend}
            className="text-sm font-semibold"
            style={{ color: "#4a5280" }}
          >
            Resend OTP
          </button>
        </div>

        {resendMsg && (
          <p className="text-center text-xs mt-2 text-green-600">{resendMsg}</p>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OtpModal;