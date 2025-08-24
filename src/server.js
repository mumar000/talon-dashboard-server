import express from "express";
import serveStatic from "serve-static";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes & Middleware
import userRoutes from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import mainBannerRoute from "./routes/mainBannerRoute.js";
import { notFound, errorHanlder } from "./middleware/errorMiddleware.js";
import { handleUploadError } from "./middleware/uploadMiddleware.js";

// Init
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Middleware
app.use(
  cors({
    origin: [
      "https://talon-admindashboard.netlify.app",
      "https://userside-testing.netlify.app",
      "http://localhost:3080",
      "http://localhost:3090",
      "https://admin.taloninternational.com",
      "https://app.taloninternational.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRoutes);
app.use("/api/banner", mainBannerRoute);

// Health & error
app.get("/", (req, res) => res.send("🟢 Talon server is running"));
app.use(notFound);
app.use(errorHanlder);
app.use(handleUploadError);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
