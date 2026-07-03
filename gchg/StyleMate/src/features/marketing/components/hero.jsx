import { Link } from "react-router-dom";
import heroImg from "../../../assets/hero.png"; // replace with your closet photo

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-5xl font-bold text-ink leading-tight mb-6">
          Your Smart Wardrobe Assistant
        </h1>
        <p className="text-lg text-muted mb-8">
          Organise your clothes, create outfits, plan your looks and get
          AI-powered suggestions tailored to your unique style and weather.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-3 font-semibold"
        >
          Get Started Free
        </Link>
      </div>
      <img src={heroImg} alt="Wardrobe" className="rounded-3xl shadow-lg" />
    </section>
  );
};

export default Hero;