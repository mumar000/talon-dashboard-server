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
} from "../controllers/adminController.js";

router.post("/auth", authAdmin);
router.post("/invite", inviteAdmin);
router.post("/logout", logoutAdmin);
//Private Routes
router
  .route("/profile")
  .get(protect, getAdminProfile)
  .put(protect, updateAdminProfile);
router.get("/getUsers", protect, getAllUsers);

export default router;
