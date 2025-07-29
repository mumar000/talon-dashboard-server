import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
import pLimit from "p-limit"; // For concurrency control

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Memory storage for file buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    files: 70, // Max 70 files
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

/**
 * Optimized Cloudinary upload with concurrency control
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @param {number} retries - Max retry attempts (default: 2)
 */
const uploadToCloudinary = async (buffer, folder = "uploads", retries = 2) => {
  const limit = pLimit(10); // Upload 10 files at a time (Cloudinary's optimal concurrency)

  const uploadWithRetry = async (attempt = 0) => {
    try {
      return await limit(
        () =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder,
                resource_type: "auto",
                quality: "auto:good", // Smart compression
                fetch_format: "auto", // Converts to WebP if possible
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
          })
      );
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Retrying upload (attempt ${attempt + 1})`);
        return uploadWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  return uploadWithRetry();
};

/**
 * Middleware to handle upload errors
 */
const handleUploadError = (err, req, res, next) => {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      message: "Maximum 70 files allowed per upload.",
    });
  } else if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File size exceeds 10MB limit.",
    });
  } else {
    return res.status(500).json({
      message: err.message || "Upload failed. Please try again.",
    });
  }
};

// Export the configured middleware
export const uploadMultiple = upload.array("files", 70);
export const uploadSingle = upload.single("file");
export const uploadCategoryImages = upload.fields([
  { name: "cardImg", maxCount: 1 },
  { name: "bannerImg", maxCount: 1 },
]);
export { uploadToCloudinary, handleUploadError };
