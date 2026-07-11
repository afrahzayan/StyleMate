/**
 * Groq Vision Service
 * ────────────────────
 * Analyzes a clothing image using a Groq vision-capable model and returns
 * structured attribute data as JSON.
 *
 * Called AFTER the image has already been uploaded to Cloudinary — it takes
 * the resulting secure_url, not the raw file, so the controller's flow is
 * strictly: Cloudinary upload -> get URL -> Groq analysis by URL.
 * If GROQ_API_KEY is missing or the call fails for any reason,
 * analyzeClothingImage() throws a clear, caught error — the calling
 * controller treats that the same as "AI couldn't identify this," saving
 * the item with null fields rather than failing the upload.
 *
 * MODEL NAME: GROQ_VISION_MODEL defaults to a placeholder below. Groq's
 * lineup of vision-capable models changes over time — confirm the current
 * model ID in Groq's docs (console.groq.com/docs/models) when you get your
 * key, and set GROQ_VISION_MODEL in .env to override the default here.
 */

const Groq = require("groq-sdk");

const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

// Categories the rest of the app understands — the AI's free-text category
// guess gets normalized into one of these before saving (see mapCategory).
const VALID_CATEGORIES = ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];

const ANALYSIS_PROMPT = `You are a fashion cataloging assistant. Analyze the clothing item in this image and return ONLY a single valid JSON object — no markdown, no code fences, no commentary before or after it.

Use this exact shape:
{
  "title": string,
  "description": string,
  "category": string,
  "subCategory": string|null,
  "color": { "primary": string|null, "secondary": string[] },
  "pattern": string|null,
  "sleeveType": string|null,
  "neckType": string|null,
  "fit": string|null,
  "fabric": string|null,
  "materialConfidence": number|null,
  "genderSuitability": "Men"|"Women"|"Unisex"|null,
  "style": string|null,
  "occasion": string|null,
  "season": string|null,
  "formality": "Formal"|"Casual"|"Semi-Formal"|null,
  "brand": string|null,
  "logosDetected": boolean|null,
  "texture": string|null,
  "length": string|null,
  "condition": "New"|"Good"|"Worn"|"Damaged"|null,
  "layeringType": "Base"|"Mid"|"Outer"|null,
  "tags": string[],
  "confidence": { "<any field name above>": number }
}

Rules:
- "category" should be your best general guess (e.g. "Shirt", "Jeans", "Sneakers", "Handbag") — it will be mapped to a fixed set afterward, so use natural clothing terminology.
- "materialConfidence" and all values inside "confidence" are numbers from 0 to 1.
- If you cannot confidently identify an attribute, set it to null. Do NOT guess just to fill a field.
- "title" should be a short, natural product-style name (e.g. "White Cotton Crew Neck T-Shirt").
- "description" should be 1-2 sentences, natural and concise.
- "tags" is an array of short lowercase fashion tags (e.g. ["casual", "summer", "cotton"]).
- Return ONLY the JSON object. Nothing else.`;

let groqClient = null;
const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Sign up at console.groq.com, add GROQ_API_KEY to backend/.env, and image analysis will start working automatically."
    );
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

/**
 * Maps the AI's free-text category guess to one of our fixed enum values.
 * Falls back to "Accessories" if nothing matches — a safe catch-all rather
 * than rejecting the save outright.
 */
const mapCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== "string") return "Accessories";
  const c = rawCategory.toLowerCase();

  if (/(shirt|t-shirt|tee|blouse|top|sweater|hoodie|jacket|coat|blazer|kurti|kurta)/.test(c))
    return "Top";
  if (/(jean|trouser|pant|short|skirt|legging|jogger)/.test(c)) return "Bottom";
  if (/(dress|gown|jumpsuit|abaya)/.test(c)) return "Dress";
  if (/(hijab|scarf|shawl)/.test(c)) return "Hijab";
  if (/(shoe|sneaker|boot|sandal|heel|slipper|flat)/.test(c)) return "Foot Wears";
  if (/(bag|handbag|backpack|purse|tote|clutch)/.test(c)) return "Bags";

  return VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "Accessories";
};

// ── Normalizers for the other strict-enum schema fields ───────────────
// Groq's vision model is asked for exact casing ("Men"/"Women"/"Unisex", etc.)
// but LLMs don't reliably respect that. Cloth.create() enforces these as
// case-sensitive Mongoose enums, so any mismatch (e.g. "unisex", "casual",
// "good", "base") previously threw an uncaught ValidationError that bubbled
// up as a generic 500 "Something went wrong while adding the item" — even
// though the AI call itself succeeded. These normalizers make the mapping
// tolerant of casing/wording the same way mapCategory() already does.
const mapGenderSuitability = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "men" || v === "male" || v === "man") return "Men";
  if (v === "women" || v === "female" || v === "woman") return "Women";
  if (v === "unisex") return "Unisex";
  return null; // unrecognized -> treat as "couldn't be identified"
};

const mapFormality = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "formal") return "Formal";
  if (v === "casual") return "Casual";
  if (v === "semi-formal" || v === "semi formal" || v === "semiformal") return "Semi-Formal";
  return null;
};

const mapCondition = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "new") return "New";
  if (v === "good") return "Good";
  if (v === "worn") return "Worn";
  if (v === "damaged") return "Damaged";
  return null;
};

const mapLayeringType = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "base") return "Base";
  if (v === "mid" || v === "middle") return "Mid";
  if (v === "outer") return "Outer";
  return null;
};

// Clamps a number into [0, 1]; returns null for anything non-numeric.
// Guards against materialConfidence/confidence violating the schema's
// min:0/max:1 validators (e.g. if the model returns a 0-100 style value).
const clampConfidence = (raw) => {
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return Math.min(1, Math.max(0, n));
};

/**
 * Analyzes a clothing image using Groq's vision model, given a **public
 * image URL** (the Cloudinary secure_url). Groq's OpenAI-compatible chat
 * completions endpoint accepts a plain https URL in `image_url.url` just
 * like it accepts a base64 data URL, so this keeps the pipeline in the
 * order Cloudinary upload -> URL -> Groq analysis.
 *
 * @param {string} imageUrl - Cloudinary secure_url of the already-uploaded image
 * @returns {Promise<object>} structured clothing attributes, category already normalized
 * @throws if GROQ_API_KEY is missing, the API call fails, or the response isn't valid JSON
 */
const analyzeClothingImage = async (imageUrl) => {
  const client = getClient();

  console.log(`[groq] Sending image to Groq for analysis -> model=${GROQ_VISION_MODEL}`);

  const completion = await client.chat.completions.create({
    model: GROQ_VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_PROMPT },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 1200,
    response_format: { type: "json_object" },
  });

  console.log("[groq] Response received from Groq");

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq returned an empty response");

  let parsed;
  try {
    parsed = JSON.parse(raw);
    console.log("[groq] JSON parsed successfully");
  } catch {
    throw new Error("Groq response was not valid JSON");
  }

  parsed.category = mapCategory(parsed.category);
  parsed.genderSuitability = mapGenderSuitability(parsed.genderSuitability);
  parsed.formality = mapFormality(parsed.formality);
  parsed.condition = mapCondition(parsed.condition);
  parsed.layeringType = mapLayeringType(parsed.layeringType);
  parsed.materialConfidence = clampConfidence(parsed.materialConfidence);

  if (parsed.confidence && typeof parsed.confidence === "object") {
    const clampedConfidence = {};
    for (const [key, value] of Object.entries(parsed.confidence)) {
      const clamped = clampConfidence(value);
      if (clamped !== null) clampedConfidence[key] = clamped;
    }
    parsed.confidence = clampedConfidence;
  }

  return parsed;
};

module.exports = {
  analyzeClothingImage,
  mapCategory,
  mapGenderSuitability,
  mapFormality,
  mapCondition,
  mapLayeringType,
  clampConfidence,
  GROQ_VISION_MODEL,
};