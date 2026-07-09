const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBufferToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products", resource_type: "image", ...options },
            (err, result) => {
                if (err) return reject(err);
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        uploadStream.end(buffer);
    });
};

const deleteFromCloudinary = (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
