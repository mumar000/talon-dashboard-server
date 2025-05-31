import asyncHandler from "express-async-handler";
import { Category, bulkUpload } from "../models/bulkUploadModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import User from "../models/userModel.js";

export const addCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please enter Category Name" });
    }
    const newCategory = new Category({ name });
    await newCategory.save();

    return res.status(201).json({
      message: "Category Created Successfully",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export const getCategories = asyncHandler(async (req, res) => {
  try {
    const allCategories = await Category.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ message: "Categories", categories: allCategories });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update the name if provided
    category.name = req.body.name || category.name;

    const updatedCategory = await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      name: updatedCategory.name,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export const deleteCategories = asyncHandler(async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deleteCategory = await Category.findByIdAndDelete(categoryId);
    return res.status(200).json({ message: "Category Delete Successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export const uploadBulkPictures = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No File Uploaded" });
    }

    const { category, type } = req.body;
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, "bulk_uploads")
    );

    const uploadedUrls = await Promise.all(uploadPromises);
    const existingDoc = await bulkUpload.findOne({ category });

    if (existingDoc) {
      existingDoc.uploaded_Pictures.push(...uploadedUrls);
      await existingDoc.save();
    } else {
      const uploadedPic = new bulkUpload({
        category,
        type,
        uploaded_Pictures: uploadedUrls,
      });

      await uploadedPic.save();
    }

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

      const bulkUploadId = pictures[0]._id;
      return res.status(200).json({
        status: true,
        message: `All Pictures of Category: ${category}`,
        bulkUploadId,
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
