import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { authAdmin,registerAdmin,getAdminProfile,updateAdminProfile,logoutAdmin } from "../controllers/adminController.js";

router.post("/auth", authAdmin);
router.post("/register",registerAdmin)
router.post("/logout", logoutAdmin)
//Private Routes
router.route("/profile").get(protect,getAdminProfile).put(protect,updateAdminProfile)

export default router;
