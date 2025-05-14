import {
  uploadBulkPictures,
  getAllPictures,
  getPicturesByCategory,
} from "../controllers/bulkUploadController.js";
import handleUploadError, {
  uploadMultiple,
} from "../middleware/uploadMiddleware.js";
import express from "express";
const router = express.Router();

router.post(
  "/upload-pictures",
  handleUploadError,
  uploadMultiple,
  uploadBulkPictures
);
router.get("/pictures/:category", getPicturesByCategory);
router.get("/getPictures", getAllPictures);

export default router;
