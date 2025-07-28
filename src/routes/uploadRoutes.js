import {
  // uploadBulkPictures,
  // getAllPictures,
  // getPicturesByCategory,
  addCategory,
  deleteCategoryWthPics,
  deleteSingleImage,
  getAllPictures,
  getCategorySlug,
  getTotalPictues,
  updateCategoryName,
  uploadPictures,
  // getCategories,
  // updateCategory,
  // deleteCategories,
} from "../controllers/bulkUploadController.js";
import {
  uploadMultiple,
  handleUploadError,
  uploadCategoryImages,
} from "../middleware/uploadMiddleware.js";
import express from "express";
const router = express.Router();

//Categories
router.post("/category/create", uploadCategoryImages, addCategory);
router.put("/:categoryId", updateCategoryName);
router.delete("/:categoryId", deleteCategoryWthPics);
router.delete("/:categoryId/delete-img", deleteSingleImage);

router.post(
  "/upload-pictures",
  uploadMultiple,
  handleUploadError,
  uploadPictures
);

router.get("/total-pics", getTotalPictues);
router.get("/getPictures", getAllPictures);
router.get("/getCategory/:slug", getCategorySlug);
// router.post(
//   "/upload-pictures",
//   uploadMultiple,
//   handleUploadError,
//   uploadBulkPictures
// );
// router.get("/pictures/:category", getPicturesByCategory);

export default router;
