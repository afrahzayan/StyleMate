import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturesSection from "../components/FeaturesSection";
import ShowcaseSection from "../components/ShowcaseSection";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="bg-cream min-h-screen">
      <Navbar />
      <Hero />
      <div className="bg-white">
        <FeaturesSection />
      </div>
      <ShowcaseSection />
      <Footer />
    </div>
  );
};

export default LandingPage;