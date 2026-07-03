import { FcGoogle } from "react-icons/fc";

const GoogleButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 font-medium text-ink hover:bg-cream transition-colors"
    >
      <FcGoogle size={20} />
      Google
    </button>
  );
};

export default GoogleButton;