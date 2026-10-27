import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a file buffer (from Multer memory storage) to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Cloudinary folder name (e.g. 'campuspass/proofs', 'campuspass/gate_photos')
 * @returns {Promise<Object>} - Resolves with Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, folder = "campuspass/general") => {
    return new Promise((resolve, reject) => {
        // Graceful check if Cloudinary keys are configured
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.CLOUDINARY_CLOUD_NAME === "your_cloudinary_cloud_name"
        ) {
            console.warn(
                "[Cloudinary Warning] Cloudinary keys not configured in .env. Returning placeholder URL."
            );
            return resolve({
                secure_url:
                    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
                public_id: "placeholder_" + Date.now(),
            });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
            },
            (error, result) => {
                if (error) {
                    console.error("[Cloudinary Upload Error]:", error);
                    return reject(error);
                }
                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

export default uploadToCloudinary;
