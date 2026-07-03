import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import useAuth from "../hooks/useAuth";
import closetImg from "../../../assets/hero.png"; // replace with your signup closet photo

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setFormError("Please accept the Terms of Service");
      return;
    }

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    if (!result.error) navigate("/dashboard");
  };

  return (
    <AuthLayout
      image={closetImg}
      title="Create Account"
      subtitle="Join us and organise your wardrobe with our digital boutique."
    >
      <h1 className="text-3xl font-bold text-ink mb-1">Sign up for StyleMate</h1>
      <p className="text-muted mb-8">Start your digital style journey today.</p>

      <form onSubmit={handleSubmit}>
        <FormInput
          icon={FiUser}
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <FormInput
          icon={FiMail}
          label="Email address"
          type="email"
          name="email"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="accent-primary"
          />
          I agree to the <span className="font-semibold text-ink">Terms of Service</span> and{" "}
          <span className="font-semibold text-ink">Privacy Policy</span>
        </label>

        {(formError || error) && (
          <p className="text-red-500 text-sm mb-4">{formError || error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-muted mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;