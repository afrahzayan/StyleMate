const FilterPills = ({ options, active, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {options.map((opt) => {
      const isActive = active === opt.value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200"
          style={{
            backgroundColor: isActive ? "#D7D8F6" : "#FFFFFF",
            color: isActive ? "#2F3447" : "#7C8197",
            borderColor: isActive ? "#D7D8F6" : "#E5E7EB",
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default FilterPills;