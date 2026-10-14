import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv"
dotenv.config()

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

export const isCloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true
    });
} else {
    console.warn("Cloudinary is not configured, image uploads will fail until CLOUDINARY_* values are set in .env");
}

// All Alankar Homes images live under this folder in the Cloudinary media library
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "alankar-homes";

export default cloudinary;
