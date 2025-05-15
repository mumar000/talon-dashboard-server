import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { handleUploadError } from "./middleware/uploadMiddleware.js";
dotenv.config();
import cookieParser from "cookie-parser";
import { notFound, errorHanlder } from "./middleware/errorMiddleware.js";
const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 5080;
import userRoutes from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import uploadRoutes from "./routes/uploadRoutes.js";
app.use(
  cors({
    origin: [
      "https://talon-admindashboard.netlify.app",
      "http://localhost:3080",
    ],
    credentials: true,
  })
);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => res.send("Talon Server is Running"));
app.use(notFound);
app.use(errorHanlder);
app.use(handleUploadError);
app.listen(PORT, () => console.log(`The server is running on ${PORT}`));
