import { useState, useEffect } from "react";

// Renders a single transparent PNG layer inside the single preview container.
// If an image URL fails to load, falls back to an SVG placeholder.
// Resets error state immediately whenever src or value changes.
const MannequinLayer = ({ src, fallbackSrc, zIndex, value }) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src, value]);

  const resolvedSrc = errored || !src ? fallbackSrc : src;

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex }}>
      <img
        src={resolvedSrc}
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