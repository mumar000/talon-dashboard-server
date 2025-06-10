import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

// dotenv.config();

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

// Memory storage for file buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    files: 70, // Limit to 70 files at once
  },
});

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || "bulk_uploads",
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

// Middleware to handle upload errors
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

export const extractPublicId = (imageUrl) => {
  try {
    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileName.split(".")[0]}`;
    return publicId;
  } catch (error) {
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Error Deleting Images", error.message);
  }
};

export const uploadMultiple = upload.array("files", 70);
// export { uploadToCloudinary, handleUploadError };
