import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

const points = [
  "Automatic background removal for clothes",
  "Weekly style reports and insights",
  "Weather-synced outfit planning",
];

const ShowcaseSection = () => {
  return (
    <section className="bg-cream py-20">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl mt-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-ink mb-4">
            Your Personal Digital Boutique
          </h2>
          <p className="text-muted mb-6">
            We believe fashion should be joyful, not stressful. StyleMate gives
            you the clarity to see what you have, the inspiration to try
            something new, and the confidence to step out looking your best.
          </p>
          <ul className="space-y-3 mb-8">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-ink">
                <FiCheck className="text-primary" />
                {p}
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="inline-block bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-3 font-semibold"
          >
            Start Your Wardrobe Audit
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;