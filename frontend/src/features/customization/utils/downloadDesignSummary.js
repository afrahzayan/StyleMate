// Builds a plain-text summary of a design's selections and estimated price,
// then triggers a browser download. No checkout, no invoice — just a
// take-away summary of what was designed.
export function downloadDesignSummary({ title, clothingType, selections = {}, price }) {
  const { measurements, ...flatSelections } = selections;
  const measurementLines = Object.entries(measurements || {})
    .filter(([, value]) => value != null && value !== "")
    .map(([field, value]) => `  - ${field}: ${value} cm`);

  const lines = [
    `StyleMate — Custom Design Summary`,
    `Design: ${title || "Untitled Design"}`,
    `Clothing Type: ${clothingType || "-"}`,
    ``,
    `Selections:`,
    ...Object.entries(flatSelections)
      .filter(([, value]) => value != null && value !== "")
      .map(([group, value]) => `  - ${group}: ${value}`),
    ...(measurementLines.length ? [``, `Measurements:`, ...measurementLines] : []),
    ``,
    `Estimated Price: Rs. ${price?.total ?? price ?? 0}`,
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(title || "design-summary").replace(/\s+/g, "-").toLowerCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}