const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="border border-border rounded-2xl p-6 bg-white">
      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center mb-4">
        <Icon className="text-primary" size={20} />
      </div>
      <h3 className="font-bold text-ink text-lg mb-2">{title}</h3>
      <p className="text-muted text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;