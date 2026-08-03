// Mirrors backend/config/cloudinaryLayers.js. Layer resolution is
// deterministic from (group, value) alone — no API round-trip needed to
// know which Cloudinary image a selection maps to, which is what lets the
// live preview update instantly.

const ROOT_FOLDER = "StyleMate/custom-design";

const LAYER_FOLDERS = {
  base: "base",
  color: "colors",
  fabric: "fabrics",
  sleeveType: "sleeves",
  neckType: "necks",
  pattern: "patterns",
  embroidery: "embroidery",
  threadWork: "thread-work",
  stoneWork: "stone-work",
  pocket: "pockets",
  buttonType: "buttons",
  cuff: "cuffs",
};

export const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const buildLayerPublicId = (group, value) => {
  const folder = LAYER_FOLDERS[group];
  if (!folder || !value) return null;
  return `${ROOT_FOLDER}/${folder}/${slugify(value)}`;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Bump this (in frontend/.env) any time you delete or replace a layer image
// in Cloudinary, then restart the dev server. It's appended to every layer
// URL as a query param, so a version bump changes the *entire* URL string —
// which means the browser can no longer serve a stale cached copy of the
// old asset, and it's also a brand-new cache key at Cloudinary's CDN edge,
// so a stale edge-cached copy can't be served either. This is a coarse,
// global cache-bust (every layer image re-fetches, not just the one you
// changed) rather than a per-asset one — deliberately, since a per-asset
// version would need a backend round-trip per layer, which breaks the
// "fully deterministic from (group, value), no API call" design this file
// is built around.
const ASSET_VERSION = import.meta.env.VITE_CLOUDINARY_ASSET_VERSION || "1";

export const buildLayerUrl = (publicId, { width = 800 } = {}) => {
  if (!publicId || !CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width},fl_progressive/${publicId}.png?v=${ASSET_VERSION}`;
};

// Rough hue per common color word, used only so the placeholder swatch (and
// the color-family wash below) is recognizable before real artwork exists.
const FALLBACK_HUES = {
  "light-blue": "#93c5fd",
  "navy-blue": "#1e3a8a",
  "royal-blue": "#2563eb",
  "pastel-green": "#86efac",
  "emerald-green": "#10b981",
  "dark-green": "#14532d",
  "pastel-red": "#fca5a5",
  "crimson-red": "#dc2626",
  "dark-red": "#7f1d1d",
  "sunny-yellow": "#fde047",
  "soft-pink": "#f472b6",
  "royal-purple": "#c084fc",
  "metallic-gold": "#fbbf24",
  white: "#f8fafc",
  black: "#27272a",
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  orange: "#f97316",
  gold: "#d4af37",
  silver: "#c0c0c0",
  colored: "#f472b6",
};

const hueFor = (value, hex) => {
  if (hex) return hex;
  const slug = slugify(value);
  for (const key of Object.keys(FALLBACK_HUES)) {
    if (slug.includes(key)) return FALLBACK_HUES[key];
  }
  return "#94a3b8";
};

/**
 * Generates a small inline SVG data-URI standing in for a layer whose real
 * Cloudinary artwork hasn't been uploaded yet.
 *
 * This used to render the same generic centered square for every group,
 * which is why switching fabric/sleeve/neck/etc. looked like nothing was
 * happening — only the color layer's fallback was visually distinct. Each
 * group now gets its own shape *and* its own position on the garment
 * silhouette, so every single selection visibly moves or changes something
 * on the preview even before real art is uploaded, and it's obvious which
 * layer you just changed.
 */
export const getPlaceholderLayer = (group, value, meta = {}) => {
  const fill = hueFor(value, meta.hex);

  const shapesByGroup = {
    base: `<rect x="90" y="60" width="220" height="380" rx="24" fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="8 8" />`,
    color: `<rect x="96" y="66" width="208" height="368" rx="20" fill="${fill}" opacity="0.55" />`,
    fabric: `<g opacity="0.35">
        ${Array.from({ length: 10 })
          .map((_, i) => `<line x1="90" y1="${80 + i * 36}" x2="310" y2="${80 + i * 36}" stroke="${fill}" stroke-width="6" />`)
          .join("")}
      </g>`,
    sleeveType: `<rect x="55" y="90" width="45" height="140" rx="14" fill="${fill}" opacity="0.75" />
      <rect x="300" y="90" width="45" height="140" rx="14" fill="${fill}" opacity="0.75" />`,
    neckType: `<path d="M160 60 Q200 110 240 60 L250 90 Q200 140 150 90 Z" fill="${fill}" opacity="0.85" />`,
    pattern: `<g opacity="0.3">
        ${Array.from({ length: 24 })
          .map((_, i) => `<circle cx="${100 + (i % 6) * 36}" cy="${100 + Math.floor(i / 6) * 60}" r="6" fill="${fill}" />`)
          .join("")}
      </g>`,
    embroidery: `<g opacity="0.9">
        ${Array.from({ length: 6 })
          .map((_, i) => `<path d="M${115 + i * 30} 400 l6 -14 l6 14 l-6 -6 z" fill="${fill}" />`)
          .join("")}
      </g>`,
    threadWork: `<g opacity="0.9">
        ${Array.from({ length: 8 })
          .map((_, i) => `<circle cx="${105 + i * 25}" cy="380" r="4" fill="${fill}" />`)
          .join("")}
      </g>`,
    stoneWork: `<g opacity="0.9">
        ${Array.from({ length: 8 })
          .map((_, i) => `<rect x="${103 + i * 25}" y="358" width="8" height="8" fill="${fill}" transform="rotate(45 ${107 + i * 25} 362)" />`)
          .join("")}
      </g>`,
    pocket: `<rect x="150" y="230" width="55" height="45" rx="6" fill="${fill}" opacity="0.8" />`,
    buttonType: `<g opacity="0.95">
        ${Array.from({ length: 5 })
          .map((_, i) => `<circle cx="200" cy="${110 + i * 40}" r="5" fill="${fill}" />`)
          .join("")}
      </g>`,
    cuff: `<rect x="55" y="215" width="45" height="18" rx="4" fill="${fill}" opacity="0.85" />
      <rect x="300" y="215" width="45" height="18" rx="4" fill="${fill}" opacity="0.85" />`,
  };

  const shape = shapesByGroup[group] || `<rect x="150" y="200" width="100" height="100" rx="10" fill="${fill}" opacity="0.6" />`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
      <rect width="400" height="500" fill="transparent" />
      ${shape}
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};