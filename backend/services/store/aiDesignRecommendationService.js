/**
 * Thin wrapper around your existing Groq integration. Mirrors the structure
 * of groqOutfitService.js / groqVisionService.js — swap the client setup
 * below for whatever you already export from those files if you'd rather
 * not instantiate a second Groq client instance.
 */
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a fashion design assistant for an online custom clothing store.
Given a customer's questionnaire answers, propose 3 to 5 distinct outfit designs that fit their
answers. Respond ONLY with a JSON array, no markdown fences, no preamble. Each item must match:
{
  "title": string,
  "selections": { "fit": string, "fabric": string, "color": string, "sleeveType": string, "neckType": string,
                   "length": string, "pattern": string, "embroidery": string, "threadWork": string, "stoneWork": string },
  "estimatedPrice": number,
  "rationale": string
}`;

async function recommendDesigns(answers) {
  const userPrompt = `Customer questionnaire answers:\n${JSON.stringify(answers, null, 2)}`;

  const completion = await groq.chat.completions.create({
    model: GROQ_TEXT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices?.[0]?.message?.content || "[]";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.log("[recommendDesigns] failed to parse Groq response:", err.message);
    return [];
  }
}

module.exports = { recommendDesigns };