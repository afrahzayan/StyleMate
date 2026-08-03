import { useState, useEffect } from "react";

// Renders a single image layer inside the preview container.
// If an image is missing or fails to load (e.g., deleted from Cloudinary),
// it is simply removed from the preview — no fallback image or SVG shape is shown.
const MannequinLayer = ({ src, zIndex, value }) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src, value]);

  if (!src || errored) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex }}>
      <img
        src={src}
        alt={value || ""}
        loading="eager"
        decoding="async"
        className="h-full w-full object-contain transition-opacity duration-200"
        onError={() => setErrored(true)}
      />
    </div>
  );
};

export default MannequinLayer;