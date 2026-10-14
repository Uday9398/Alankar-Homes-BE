import cloudinary, { CLOUDINARY_FOLDER, isCloudinaryConfigured } from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";

// Uploads one image held in memory and resolves with its https URL
const uploadBuffer = (buffer, subFolder) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        {
            folder: `${CLOUDINARY_FOLDER}/${subFolder}`,
            resource_type: "image",
            // Shrink very large photos once at upload so we don't store huge originals
            transformation: [{ width: 2000, height: 2000, crop: "limit" }]
        },
        (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
});

const uploadImages = async (files, subFolder = "products") => {
    if (!isCloudinaryConfigured) {
        throw new AppError("Image storage is not set up yet, please contact the site owner", 503);
    }
    try {
        return await Promise.all(files.map((file) => uploadBuffer(file.buffer, subFolder)));
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new AppError("Could not upload images, please try again", 502);
    }
};

export { uploadImages };
