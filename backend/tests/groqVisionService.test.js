const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeAnalysisResponse } = require("../services/groqVisionService");

test("normalizes partial AI responses and infers a category from the title", () => {
  const result = normalizeAnalysisResponse({
    name: "Blue Denim Jacket",
    description: "A fitted jacket for casual wear",
    color: { primary: "blue" },
    confidence: { title: 0.9 },
  });

  assert.equal(result.title, "Blue Denim Jacket");
  assert.equal(result.category, "Top");
  assert.equal(result.description, "A fitted jacket for casual wear");
  assert.equal(result.color.primary, "blue");
});

test("uses a safe fallback when the model returns an empty or invalid payload", () => {
  const result = normalizeAnalysisResponse(null);

  assert.equal(result.title, "Untitled Item");
  assert.equal(result.category, "Accessories");
  assert.deepEqual(result.color, { primary: null, secondary: [] });
});
