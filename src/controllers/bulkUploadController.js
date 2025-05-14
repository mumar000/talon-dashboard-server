import asyncHandler from "express-async-handler";
import bulkUpload from "../models/bulkUploadModel.js";
import { uploadtoCloudinary } from "../services/cloudinary.js";
import { all } from "axios";

export const uploadBulkPictures = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    if (!files || files === 0) {
      return res.status(400).json({ message: "No File Uploaded" });
    }

    const { category, type } = req.body;
    const uploadPromises = files.map((file) => uploadtoCloudinary(file));
    const uploadedUrls = await Promise.all(uploadPromises);

    let uploadedPic;

    uploadedPic = new bulkUpload({
      category,
      type,
      uploaded_Pictures: uploadedUrls,
    });

    await uploadedPic.save();

    return res.status(200).json({
      status: true,
      message: "Pictures Uploaded Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export const getAllPictures = asyncHandler(async (req, res) => {
  const allPictures = await bulkUpload.find().sort({ createdAt: -1 });
  if (allPictures) {
    res.status(200).json({
      messaage: "All Categories",
      allPictures,
    });
  } else {
    res.status(500).json({
      message: "Error Findind data",
    });
  }
});
