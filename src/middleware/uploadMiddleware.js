import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

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
    files: 70, // Limit to 70 files at once
  },
});

/**
 * Upload file buffer to Cloudinary using a stream
 */
const uploadToCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Middleware to handle upload errors
 */
const handleUploadError = (err, req, res, next) => {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      message: "Too many file uploads, please check the limits",
    });
  } else if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File size is too large, max limit is 10MB per file",
    });
  } else {
    return res.status(500).json({
      message: err.message || "An unexpected error occurred during the upload.",
    });
  }
};

// Export the configured middleware
export const uploadMultiple = upload.array("files", 70);
export const uploadSingle = upload.single("file"); // "file" is the name of the field in your form
export { uploadToCloudinary, handleUploadError };
