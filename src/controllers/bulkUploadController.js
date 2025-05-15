import asyncHandler from "express-async-handler";
import bulkUpload from "../models/bulkUploadModel.js";
import { uploadtoCloudinary } from "../services/cloudinary.js";

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

export const getPicturesByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({
        status: false,
        message: "Category is required",
      });
    }

    const pictures = await bulkUpload
      .find({ category: category })
      .sort({ createdAt: -1 });

    if (pictures.length > 0) {
      const allPictures = pictures.flatMap((doc) => doc.uploaded_Pictures);
      return res.status(200).json({
        status: true,
        message: `All Pictures of Category: ${category}`,
        pictures: allPictures,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Not picture found in this category" });
    }
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
