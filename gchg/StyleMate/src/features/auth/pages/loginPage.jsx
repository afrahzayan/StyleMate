import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import GoogleButton from "../components/GoogleButton";
import useAuth from "../hooks/useAuth";
import closetImg from "../../../assets/hero.png"; // replace with your login closet photo

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (!result.error) navigate("/dashboard");
  };

  return (
    <AuthLayout
      image={closetImg}
      title="Welcome Back"
      subtitle="Step back into your personal style sanctuary and rediscover your perfect look."
    >
      <h1 className="text-3xl font-bold text-ink mb-1">Login to your account</h1>
      <p className="text-muted mb-8">Please enter your details to continue</p>

      <form onSubmit={handleSubmit}>
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
        <PasswordInput
          label="Password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end mb-6 -mt-3">
          <Link to="/forgot-password" className="text-sm text-primary font-medium">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted tracking-wide">OR CONTINUE WITH</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton />

        <p className="text-center text-muted mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;