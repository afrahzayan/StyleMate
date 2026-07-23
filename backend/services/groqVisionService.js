const Groq = require("groq-sdk");

const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";

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

const mapCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== "string") return "Accessories";
  const c = rawCategory.toLowerCase();

  if (/(shirt|t-shirt|tee|blouse|top|sweater|hoodie|jacket|coat|blazer|kurti|kurta|cardigan)/.test(c))
    return "Top";
  if (/(jean|trouser|pant|short|skirt|legging|jogger|trouser|saree|palazzo)/.test(c)) return "Bottom";
  if (/(dress|gown|jumpsuit|abaya|lehenga)/.test(c)) return "Dress";
  if (/(hijab|scarf|shawl)/.test(c)) return "Hijab";
  if (/(shoe|sneaker|boot|sandal|heel|slipper|flat|loafer)/.test(c)) return "Foot Wears";
  if (/(bag|handbag|backpack|purse|tote|clutch|wallet)/.test(c)) return "Bags";

  return VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "Accessories";
};

const inferCategoryFromText = (text) => {
  if (!text || typeof text !== "string") return null;
  const normalized = text.toLowerCase();

  if (/(shirt|t-shirt|tee|blouse|top|sweater|hoodie|jacket|coat|blazer|kurti|kurta|cardigan)/.test(normalized)) {
    return "Top";
  }
  if (/(jean|trouser|pant|short|skirt|legging|jogger|palazzo)/.test(normalized)) {
    return "Bottom";
  }
  if (/(dress|gown|jumpsuit|abaya|lehenga)/.test(normalized)) {
    return "Dress";
  }
  if (/(hijab|scarf|shawl)/.test(normalized)) {
    return "Hijab";
  }
  if (/(shoe|sneaker|boot|sandal|heel|slipper|flat|loafer)/.test(normalized)) {
    return "Foot Wears";
  }
  if (/(bag|handbag|backpack|purse|tote|clutch|wallet)/.test(normalized)) {
    return "Bags";
  }
  return null;
};

const normalizeAnalysisResponse = (rawPayload) => {
  const fallback = {
    title: "Untitled Item",
    description: "",
    category: "Accessories",
    subCategory: null,
    color: { primary: null, secondary: [] },
    pattern: null,
    sleeveType: null,
    neckType: null,
    fit: null,
    fabric: null,
    materialConfidence: null,
    genderSuitability: null,
    style: null,
    occasion: null,
    season: null,
    formality: null,
    brand: null,
    logosDetected: null,
    texture: null,
    length: null,
    condition: null,
    layeringType: null,
    tags: [],
    confidence: {},
  };

  if (!rawPayload) return fallback;

  let parsed = rawPayload;
  if (typeof rawPayload === "string") {
    try {
      parsed = JSON.parse(rawPayload);
    } catch (err) {
      const matched = rawPayload.match(/\{[\s\S]*\}/);
      if (matched) {
        try {
          parsed = JSON.parse(matched[0]);
        } catch (innerErr) {
          parsed = {};
        }
      } else {
        parsed = {};
      }
    }
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const title = parsed.title || parsed.name || parsed.itemName || parsed.item_name || parsed.productName || parsed.product_name || null;
    const description = parsed.description || parsed.summary || parsed.notes || "";
    const categorySource = parsed.category || parsed.type || parsed.itemType || parsed.item_type || parsed.clothingType || title || null;
    const category = mapCategory(categorySource) || inferCategoryFromText(title || description) || "Accessories";

    const colorSource = parsed.color || parsed.colour || null;
    const color =
      colorSource && typeof colorSource === "object"
        ? {
          primary: colorSource.primary || colorSource.main || colorSource.base || null,
          secondary: Array.isArray(colorSource.secondary) ? colorSource.secondary : [],
        }
        : typeof colorSource === "string"
          ? { primary: colorSource, secondary: [] }
          : { primary: null, secondary: [] };

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
      : typeof parsed.tags === "string"
        ? parsed.tags.split(/[,/]+/).map((tag) => tag.trim()).filter(Boolean)
        : [];

    return {
      ...fallback,
      title: title ? String(title).trim() : fallback.title,
      description: description ? String(description).trim() : fallback.description,
      category,
      subCategory: parsed.subCategory ?? parsed.subcategory ?? null,
      color,
      pattern: parsed.pattern ?? null,
      sleeveType: parsed.sleeveType ?? parsed.sleeve_type ?? null,
      neckType: parsed.neckType ?? parsed.neck_type ?? null,
      fit: parsed.fit ?? null,
      fabric: parsed.fabric ?? null,
      materialConfidence: clampConfidence(parsed.materialConfidence ?? parsed.material_confidence),
      genderSuitability: mapGenderSuitability(parsed.genderSuitability ?? parsed.gender_suitability),
      style: parsed.style ?? null,
      occasion: parsed.occasion ?? null,
      season: parsed.season ?? null,
      formality: mapFormality(parsed.formality ?? parsed.formalityLevel),
      brand: parsed.brand ?? null,
      logosDetected: typeof parsed.logosDetected === "boolean" ? parsed.logosDetected : null,
      texture: parsed.texture ?? null,
      length: parsed.length ?? null,
      condition: mapCondition(parsed.condition ?? parsed.conditionType),
      layeringType: mapLayeringType(parsed.layeringType ?? parsed.layering_type),
      tags,
      confidence: parsed.confidence && typeof parsed.confidence === "object" ? parsed.confidence : {},
    };
  }

  return fallback;
};

const mapGenderSuitability = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "men" || v === "male" || v === "man") return "Men";
  if (v === "women" || v === "female" || v === "woman") return "Women";
  if (v === "unisex") return "Unisex";
  return null;
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

const clampConfidence = (raw) => {
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return Math.min(1, Math.max(0, n));
};

const analyzeClothingImage = async (imageUrl, retries = 2) => {
  console.log(`[groq] Sending image to Groq for analysis -> model=${GROQ_VISION_MODEL}`);
  console.log(`[groq] Image URL: ${imageUrl}`);

  let client;
  try {
    client = getClient();
  } catch (err) {
    console.log("[groq] Unable to initialize Groq client:", err.message);
    return {
      ...normalizeAnalysisResponse(null),
      analysisFailed: true,
      failureReason: err.message,
    };
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
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
        max_tokens: 3072,
        reasoning_effort: "none",
      });

      console.log("[groq] Response received from Groq");
      console.log("[groq] Finish reason:", completion.choices?.[0]?.finish_reason);

      let raw = completion.choices?.[0]?.message?.content;
      if (!raw) throw new Error("Groq returned an empty response");
      raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

      console.log("[groq] Raw response (first 500 chars):", raw.substring(0, 500));

      let parsed;
      try {
        parsed = normalizeAnalysisResponse(raw);
        console.log("[groq] Analysis response normalized successfully");
        console.log("[groq] Parsed title:", parsed.title);
        console.log("[groq] Parsed category:", parsed.category);
      } catch (parseErr) {
        console.log("[groq] Analysis normalization failed:", parseErr.message);
        parsed = normalizeAnalysisResponse(null);
      }

      if (parsed.confidence && typeof parsed.confidence === "object") {
        const clampedConfidence = {};
        for (const [key, value] of Object.entries(parsed.confidence)) {
          const clamped = clampConfidence(value);
          if (clamped !== null) clampedConfidence[key] = clamped;
        }
        parsed.confidence = clampedConfidence;
      }

      return parsed;
    } catch (err) {
      lastError = err;
      console.log(`[groq] Attempt ${attempt + 1} failed:`, err.message);
      if (err.status) console.log(`[groq] HTTP status: ${err.status}`);
      if (err.response?.data) console.log(`[groq] Error body:`, JSON.stringify(err.response.data));
      if (attempt < retries) {
        const delay = 1000 * (attempt + 1);
        console.log(`[groq] Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  return {
    ...normalizeAnalysisResponse(null),
    analysisFailed: true,
    failureReason: lastError?.message || "AI analysis failed",
  };
};

module.exports = {
  analyzeClothingImage,
  normalizeAnalysisResponse,
  mapCategory,
  mapGenderSuitability,
  mapFormality,
  mapCondition,
  mapLayeringType,
  clampConfidence,
  GROQ_VISION_MODEL,
};
