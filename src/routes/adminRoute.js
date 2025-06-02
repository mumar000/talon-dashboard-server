import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import {
  authAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
  getAllUsers,
  inviteAdmin,
  updateAvatar,
} from "../controllers/adminController.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

router.post("/auth", authAdmin);
router.post("/invite", protect, inviteAdmin);
router.post("/logout", logoutAdmin);
//Private Routes
router
  .route("/profile")
  .get(protect, getAdminProfile)
  .put(protect, updateAdminProfile);
router.post("/avatar", protect, uploadSingle, updateAvatar);
router.get("/getUsers", protect, getAllUsers);

export default router;
