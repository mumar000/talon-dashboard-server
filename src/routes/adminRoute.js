import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import {
  authAdmin,
  registerAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
  getAllUsers,
} from "../controllers/adminController.js";

router.post("/auth", authAdmin);
router.post("/register", registerAdmin);
router.post("/logout", logoutAdmin);
//Private Routes
router
  .route("/profile/:id")
  .get(protect, getAdminProfile)
  .put(protect, updateAdminProfile);
router.get("/getUsers", protect, getAllUsers);

export default router;
