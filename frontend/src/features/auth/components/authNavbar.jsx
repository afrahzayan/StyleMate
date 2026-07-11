import { useNavigate } from "react-router-dom";

const AuthNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav
      className="w-full flex items-center justify-between px-6 md:px-10 py-4 border-b bg-white"
      style={{ borderColor: "#ede8e0" }}
    >
      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <span className="text-lg">👔</span>
        <span className="font-extrabold text-base" style={{ color: "#343857" }}>
          StyleMate
        </span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ color: "#4a5280" }}
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#4a5280" }}
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default AuthNavbar;
