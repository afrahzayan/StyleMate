import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, Check } from "lucide-react";

const SortMenu = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200"
        style={{ color: "#52557A" }}
      >
        <ArrowUpDown size={14} />
        {current.label}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-48 rounded-xl bg-white overflow-hidden z-10"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(47,52,71,0.12)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left hover:bg-[#FAF8F2] transition-colors"
              style={{ color: "#2F3447" }}
            >
              {opt.label}
              {opt.value === value && <Check size={14} style={{ color: "#52557A" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortMenu;