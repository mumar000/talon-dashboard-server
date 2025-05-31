import {
  uploadBulkPictures,
  getAllPictures,
  getPicturesByCategory,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategories,
} from "../controllers/bulkUploadController.js";
import {
  uploadMultiple,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";
import express from "express";
const router = express.Router();

//Categories
router.post("/category/create", addCategory);
router.get("/category", getCategories);
router.put("/category/update/:id", updateCategory);
router.delete("/category/delete/:id", deleteCategories);

router.post(
  "/upload-pictures",
  uploadMultiple,
  handleUploadError,
  uploadBulkPictures
);
router.get("/pictures/:category", getPicturesByCategory);
router.get("/getPictures", getAllPictures);

export default router;
