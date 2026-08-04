import { Link } from "react-router-dom";

const CustomizationHomePage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-14 flex flex-col items-center gap-5 rounded-3xl bg-gray-900 px-8 py-16 text-center text-white">
        <h1 className="text-3xl font-semibold sm:text-4xl">Design Your Dream Outfit</h1>
        <p className="max-w-lg text-sm text-gray-300">
          Answer a few questions about what you want, watch it take shape on a live preview, and see the
          price update as you go.
        </p>
        <Link to="/customize/new" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900">
          Start Customizing
        </Link>
      </section>
    </div>
  );
};

export default CustomizationHomePage;