import express from "express";
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  submitInquiry,
  getInquiryForm,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.post("/submitInquiry", protect, submitInquiry);
router.get("/getInquiry", protect, getInquiryForm);
router
  .route("/profile/:id")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
export default router;
