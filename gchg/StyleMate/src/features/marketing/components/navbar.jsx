import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
      <span className="text-xl font-bold text-ink">StyleMate</span>
      <nav className="hidden md:flex items-center gap-8 text-ink font-medium">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="px-5 py-2 rounded-full border border-border font-medium text-ink"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-5 py-2 rounded-full bg-primary text-white font-medium"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Navbar;