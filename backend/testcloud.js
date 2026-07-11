require("dotenv").config({ quiet: true });
const cloudinary = require("cloudinary").v2;

console.log("cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("api_key:", process.env.CLOUDINARY_API_KEY);
console.log("api_secret set:", Boolean(process.env.CLOUDINARY_API_SECRET));
console.log("cloud_name (boundaries):", `[${process.env.CLOUDINARY_CLOUD_NAME}]`);
console.log("api_key (boundaries):", `[${process.env.CLOUDINARY_API_KEY}]`);
console.log("api_secret length:", (process.env.CLOUDINARY_API_SECRET || "").length);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TEST_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function run() {
  console.log("\n--- Step 1: ping (tests auth only, no upload permission needed) ---");
  try {
    const pingResult = await cloudinary.api.ping();
    console.log("PING SUCCESS:", pingResult);
  } catch (err) {
    console.log("PING FAILED:", err);
  }

  console.log("\n--- Step 2a: upload WITH legacy folder param (current app behavior) ---");
  try {
    const result = await cloudinary.uploader.upload(TEST_IMAGE, { folder: "stylemate/test" });
    console.log("2a SUCCESS:", result.secure_url);
  } catch (err) {
    console.log("2a FAILED:", err);
  }

  console.log("\n--- Step 2b: upload with NO folder param at all ---");
  try {
    const result = await cloudinary.uploader.upload(TEST_IMAGE);
    console.log("2b SUCCESS:", result.secure_url);
  } catch (err) {
    console.log("2b FAILED:", err);
  }

  console.log("\n--- Step 2c: upload WITH asset_folder (dynamic-folder-mode param) ---");
  try {
    const result = await cloudinary.uploader.upload(TEST_IMAGE, { asset_folder: "stylemate/test" });
    console.log("2c SUCCESS:", result.secure_url);
  } catch (err) {
    console.log("2c FAILED:", err);
  }
}

run();
