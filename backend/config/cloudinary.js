const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an in-memory buffer (from multer memoryStorage) to Cloudinary.
 * Using upload_stream instead of multer-storage-cloudinary because we need
 * the raw buffer available to hand to the Groq vision service in the same
 * request — multer-storage-cloudinary uploads directly and doesn't give us
 * that buffer back.
 *
 * @param {Buffer} buffer
 * @param {string} folder - Cloudinary folder, e.g. "stylemate/clothes"
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadBufferToCloudinary = (buffer, folder = "stylemate/clothes") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto:good", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * Used when a cloth item is hard-deleted or its image is replaced.
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };