import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import FormInput from "../components/FormInput";
import useAuth from "../hooks/useAuth";

const ForgotPasswordPage = () => {
  const { forgotPassword, isLoading, error, message } = useAuth();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-10">
        <h1 className="text-2xl font-bold text-ink mb-1">Forgot Password</h1>
        <p className="text-muted mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <FormInput
            icon={FiMail}
            label="Email address"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-muted mt-8">
          Remembered it?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;