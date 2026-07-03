import { GiHanger } from "react-icons/gi";
import { HiOutlineSquares2X2, HiSparkles } from "react-icons/hi2";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: GiHanger,
    title: "Wardrobe Management",
    description:
      "Digitize your closet in minutes. Categorize by season, color, and style to always know exactly what you own.",
  },
  {
    icon: HiOutlineSquares2X2,
    title: "Outfit Builder",
    description:
      "Mix and match pieces virtually. Save your favorite combinations for different occasions and events.",
  },
  {
    icon: HiSparkles,
    title: "AI Suggestions",
    description:
      "Our smart engine learns your style and suggests new ways to wear your items based on trends and weather.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="max-w-7xl mx-auto px-8 py-20 text-center">
      <h2 className="text-3xl font-bold text-ink mb-3">Designed for Your Lifestyle</h2>
      <p className="text-muted max-w-xl mx-auto mb-12">
        Every tool you need to master your wardrobe and look your best every
        single day, powered by intuitive technology.
      </p>
      <div className="grid md:grid-cols-3 gap-6 text-left">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;