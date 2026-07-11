import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🪡",
    title: "Wardrobe Management",
    desc: "Digitize your closet in minutes. Categorize by season, color, and style to always know exactly what you own.",
  },
  {
    icon: "✨",
    title: "Outfit Builder",
    desc: "Mix and match pieces virtually. Save your favorite combinations for different occasions and events.",
  },
  {
    icon: "🤖",
    title: "AI Suggestions",
    desc: "Our smart engine learns your style and suggests new ways to wear your items based on trends and weather.",
  },
];

const bullets = [
  "Automatic background removal for clothes",
  "Weekly style reports and insights",
  "Weather-synced outfit planning",
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "#faf8f5", minHeight: "100vh" }}>

      <nav
        className="flex items-center justify-between px-8 md:px-16 py-5 sticky top-0 z-10 bg-white border-b"
        style={{ borderColor: "#ede8e0" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">👔</span>
          <div>
            <p className="font-extrabold text-base leading-tight" style={{ color: "#343857" }}>
              StyleMate
            </p>
            <p className="text-xs text-gray-400 leading-tight">Virtual Wardrobe</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full text-sm font-semibold border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#4a5280", color: "#4a5280" }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4a5280" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-20 gap-12">

        <div className="max-w-lg">
          <h1
            className="text-5xl font-extrabold leading-tight mb-5"
            style={{ color: "#343857" }}
          >
            Your Smart<br />Wardrobe Assistant
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Organise your clothes, create outfits, plan your looks and get
            AI-powered suggestions tailored to your unique style and weather.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4a5280" }}
          >
            Get Started Free
          </button>
        </div>

        <div
          className="w-full max-w-sm h-72 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#ddd7cb" }}
        >
          <div className="text-center text-gray-500">
            <div className="flex gap-4 mb-3 justify-center">
              {["👗", "👔", "👠"].map((e) => (
                <span key={e} className="text-4xl">{e}</span>
              ))}
            </div>
            <p className="text-sm font-medium">Your Digital Wardrobe</p>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-16 py-16 text-center">
        <h2
          className="text-2xl font-extrabold mb-2"
          style={{ color: "#343857" }}
        >
          Designed for Your Lifestyle
        </h2>
        <p className="text-gray-500 text-sm mb-12 max-w-md mx-auto leading-relaxed">
          Every tool you need to master your wardrobe and look your best every
          single day, powered by intuitive technology.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 text-left shadow-sm border"
              style={{ borderColor: "#ede8e0" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ backgroundColor: "#eef0f8" }}
              >
                {f.icon}
              </div>
              <h3
                className="font-bold text-sm mb-2"
                style={{ color: "#1c1c2e" }}
              >
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="px-8 md:px-16 py-16 flex flex-col md:flex-row items-center gap-12"
        style={{ backgroundColor: "#ede8e0" }}
      >
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs shrink-0">
          {[
            { emoji: "👠", bg: "#c8b8a2" },
            { emoji: "👗", bg: "#d4c4b0" },
            { emoji: "💍", bg: "#bfb0a0" },
            { emoji: "🧥", bg: "#c0b09a" },
          ].map((item, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: item.bg }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        <div className="max-w-md">
          <h2
            className="text-3xl font-extrabold mb-4"
            style={{ color: "#343857" }}
          >
            Your Personal Digital Boutique
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            We believe fashion should be joyful, not stressful. StyleMate gives
            you the clarity to see what you have, the inspiration to try
            something new, and the confidence to step out looking your best.
          </p>
          <ul className="space-y-3 mb-8">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: "#4a5280" }}
                >
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-white"
            style={{ borderColor: "#4a5280", color: "#4a5280" }}
          >
            Start your Wardrobe Audit
          </button>
        </div>
      </section>

      <footer
        className="text-center py-6 text-xs text-gray-400 border-t"
        style={{ borderColor: "#ede8e0" }}
      >
        © 2024 StyleMate Digital Boutique. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;