import { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = ({ label, ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-ink mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
        <FiLock className="text-muted shrink-0" size={18} />
        <input
          type={visible ? "text" : "password"}
          className="w-full outline-none text-ink placeholder:text-muted bg-transparent"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-muted"
        >
          {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;