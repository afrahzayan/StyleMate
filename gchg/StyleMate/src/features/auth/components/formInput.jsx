const FormInput = ({ icon: Icon, label, ...props }) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-ink mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
        {Icon && <Icon className="text-muted shrink-0" size={18} />}
        <input
          className="w-full outline-none text-ink placeholder:text-muted bg-transparent"
          {...props}
        />
      </div>
    </div>
  );
};

export default FormInput;