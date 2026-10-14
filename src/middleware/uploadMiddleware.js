import path from "path";
import multer from "multer";

// Old photos uploaded before the move to Cloudinary are still served from here
export const UPLOAD_ROOT = path.resolve("uploads");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Files are kept in memory and streamed straight to Cloudinary.
// Wraps multer so its errors come back in the usual JSON shape.
const imageUpload = (maxFiles) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024,
            files: maxFiles
        },
        fileFilter: (req, file, cb) => {
            if (!ALLOWED_TYPES.includes(file.mimetype)) {
                return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
            }
            cb(null, true);
        }
    });

    return (req, res, next) => {
        upload.array("images", maxFiles)(req, res, (error) => {
            if (error) {
                let message = error.message;
                if (error.code === "LIMIT_FILE_SIZE") message = "Each image must be 5 MB or smaller";
                if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
                    message = `You can upload up to ${maxFiles} images at a time`;
                }
                return res.status(400).json({
                    success: false,
                    message
                });
            }
            next();
        });
    };
};

export const uploadProductImages = imageUpload(8);

// Reference photos customers attach to a custom order request
export const uploadCustomRequestImages = imageUpload(5);

export default uploadProductImages;
