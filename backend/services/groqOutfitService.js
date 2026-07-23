const Groq = require("groq-sdk");

const GROQ_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-120b";

let groqClient = null;
const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to backend/.env — the same key already used for wardrobe image analysis works here too."
    );
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const buildPrompt = ({ wardrobeContext, occasion, season, preferredColors, suggestionCount }) => {
  const colorLine = preferredColors?.length
    ? `Preferred colors (nice-to-have, not mandatory): ${preferredColors.join(", ")}.`
    : "No specific color preference — use your judgement for good color harmony.";

  return `You are a professional fashion stylist assembling outfits for a real user from their EXISTING wardrobe only.

WARDROBE (JSON array — this is the complete and ONLY set of items you may use):
${JSON.stringify(wardrobeContext)}

Occasion: ${occasion}
Season: ${season || "Any"}
${colorLine}

RULES (all mandatory):
1. Every id you use in "items" MUST be copied EXACTLY from the "id" field of an object in the WARDROBE array above. Never invent, guess, or modify an id. Never reference an item that is not in the array.
2. Do not repeat the exact same id within a single outfit.
3. Prefer combining complementary categories when available in the wardrobe (e.g. a Top + Bottom, or a single Dress, plus Foot Wears, and a Bag/Hijab/Accessories if present) — but only include categories that actually exist in the wardrobe above. Never leave an outfit with just one item if better combinations are possible.
4. Apply good color harmony (e.g. white+blue, black+grey, cream+brown, navy+white, beige+maroon, neutral or pastel combinations) when choosing between multiple valid options — avoid clashing colors when a better-matching alternative exists in the wardrobe.
5. Generate exactly ${suggestionCount} DIFFERENT outfits. Reuse of individual items across the ${suggestionCount} outfits is fine, but the outfits themselves must be meaningfully different combinations, not near-duplicates.
6. "confidence" is your own 0–100 estimate of how well the outfit fits the requested occasion/season/colors.
7. "explanation" is 1–2 natural sentences explaining why the outfit works for this occasion (mention the actual pieces and why the colors/style suit it).
8. "label" is a short 1–3 word vibe tag for the outfit (e.g. "Fresh Look", "Casual Chic", "Office Ready").

Return ONLY a single valid JSON object — no markdown, no code fences, no commentary — in exactly this shape:
{
  "outfits": [
    { "items": ["<id>", "<id>"], "label": string, "explanation": string, "confidence": number }
  ]
}`;
};

const generateOutfitSuggestions = async ({
  wardrobeContext,
  occasion,
  season,
  preferredColors,
  suggestionCount,
}) => {
  const client = getClient();
  const prompt = buildPrompt({ wardrobeContext, occasion, season, preferredColors, suggestionCount });

  console.log(
    `[groq-outfit] Requesting ${suggestionCount} outfits -> model=${GROQ_TEXT_MODEL}, wardrobeItems=${wardrobeContext.length}, occasion=${occasion}`
  );

  const completion = await client.chat.completions.create({
    model: GROQ_TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_completion_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq returned an empty response");

  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    throw new Error("Groq response was not valid JSON");
  }

  console.log(`[groq-outfit] Received ${parsed?.outfits?.length ?? 0} candidate outfits`);

  return { raw, parsed };
};

module.exports = {
  generateOutfitSuggestions,
  GROQ_TEXT_MODEL,
};
