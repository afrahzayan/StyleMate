const AuthLayout = ({ image, title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left image panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/30" />
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h1 className="text-4xl font-bold mb-3">{title}</h1>
          <p className="text-lg text-white/90">{subtitle}</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12 relative">
        <div className="absolute top-8 right-8 flex items-center gap-2 text-ink font-semibold">
          <span>StyleMate</span>
        </div>
        <div className="max-w-md w-full mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;