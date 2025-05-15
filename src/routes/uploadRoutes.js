import {
  uploadBulkPictures,
  getAllPictures,
  getPicturesByCategory,
} from "../controllers/bulkUploadController.js";
import {
  uploadMultiple,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";
import express from "express";
const router = express.Router();

router.post(
  "/upload-pictures",
  uploadMultiple,
  handleUploadError,
  uploadBulkPictures
);
router.get("/pictures/:category", getPicturesByCategory);
router.get("/getPictures", getAllPictures);

export default router;
