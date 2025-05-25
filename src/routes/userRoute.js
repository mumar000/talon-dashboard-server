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
  savingPicture,
  getSavedPictures,
  updateProfilePic,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.post("/submitInquiry", protect, submitInquiry);
router.get("/getInquiry", protect, getInquiryForm);
router
  .route("/profile/:id")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post("/save-picture", protect, savingPicture);
router.get("/get-savePics", protect, getSavedPictures);

router.post("/profile/picture", protect, uploadSingle, updateProfilePic);
export default router;
