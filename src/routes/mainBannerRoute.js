import express from "express";
const router = express.Router();
import {
  createMainBanner,
  updateMainBanner,
  getMainBanners,
  getMainBannerById,
  deleteMainBanner,
} from "../controllers/mainBannerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

router.route("/").post(uploadSingle, createMainBanner).get(getMainBanners);
router
  .route("/:id")
  .get(getMainBannerById)
  .put(protect, uploadSingle, updateMainBanner)
  .delete(protect, deleteMainBanner);

export default router;
