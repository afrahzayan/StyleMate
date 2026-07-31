import { useState } from "react";

// Renders a single layer. Deliberately dumb — all the "which layer, in what
// order" decisions live in layerRegistry.js, not here. This is what makes
// the mannequin easy to swap for a Three.js renderer later without
// touching layerRegistry.js or the wizard.
//
// If the real Cloudinary artwork for this layer hasn't been uploaded yet,
// `src` 404s and we fall back to a labeled placeholder swatch so the studio
// still feels alive during development — swap in real art later with zero
// code changes (see cloudinaryLayers.js upload convention).
const MannequinLayer = ({ src, fallbackSrc, zIndex, value }) => {
  const [errored, setErrored] = useState(false);
  const resolvedSrc = errored || !src ? fallbackSrc : src;

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex }}>
      <img
        src={resolvedSrc}
        alt={value || ""}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
        onError={() => setErrored(true)}
      />
    </div>
  );
};

export default MannequinLayer;