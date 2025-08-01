import asyncHandler from "express-async-handler";
import { Category } from "../models/bulkUploadModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import User from "../models/userModel.js";
import {
  deleteFromCloudinary,
  extractPublicId,
} from "../services/cloudinary.js";
import pLimit from "p-limit";
import slugify from "slugify";


export const addCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    
    const cardImgBuffer = req.files?.cardImg[0]?.buffer
    const bannerImgBuffer = req.files?.bannerImg[0]?.buffer;

    if(!cardImgBuffer || !bannerImgBuffer){
      return res.status(400).json({
        status:false,
        message:"Please upload image for card"
      })
    }

    const cardImgUrl = await uploadToCloudinary(cardImgBuffer, "cardImg")
    const bannerImgUrl = await uploadToCloudinary(bannerImgBuffer, "bannerImg")
   
    const slug = slugify(name, { lower: true });

    const existingCategory = await Category.findOne({ name });  

    if (existingCategory) {
      return res.status(400).json({ message: "Category Already Exists" });
    }

    const newCategory = await Category.create({ name, slug,cardImg:cardImgUrl, bannerImg:bannerImgUrl  });

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

export const uploadPictures = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    if (!files?.length) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const { categoryId, type } = req.body;

    // 1. Find category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // 2. Upload in optimized batches
    const CONCURRENT_UPLOADS = 10;
    const limit = pLimit(CONCURRENT_UPLOADS);
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
      const batch = files.slice(i, i + CONCURRENT_UPLOADS);
      const batchResults = await Promise.all(
        batch.map((file) =>
          limit(() =>
            uploadToCloudinary(file.buffer, "bulk_uploads").catch((e) => {
              console.warn(`Failed upload: ${e.message}`);
              return null;
            })
          )
        )
      );
      uploadedUrls.push(...batchResults.filter((url) => url));
    }

    // 3. Prepare update operation
    const update = {
      $inc: { totalUploadPics: uploadedUrls.length },
      $set: { updatedAt: new Date() },
    };

    // Check if type exists
    const typeIndex = category.types.findIndex((t) => t.type === type);

    if (typeIndex >= 0) {
      // Type exists - push to existing array
      update.$push = {
        [`types.${typeIndex}.uploaded_Pictures`]: { $each: uploadedUrls },
      };
    } else {
      // Type doesn't exist - create new type
      update.$push = {
        types: { type, uploaded_Pictures: uploadedUrls },
      };
    }

    // 4. Execute update
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      update,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${uploadedUrls.length}/${files.length} images uploaded.`,
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Upload failed. Please try again.",
      error: error.message,
    });
  }
});

export const getAllPictures = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({ message: "All Categories", category: categories });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

export const updateCategoryName = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(400).json({ message: "Category name already exists" });
    }

   

    category.name = name;

    const imageFields = ["cardImg","bannerImg"]

    for (const field of imageFields){
      if(req.files?.[field]?.[0]){
        const buffer = req.files[field][0].buffer;
        const url = await uploadToCloudinary(buffer, field)
        category[field] = url
      }
    }

    await category.save()

    res.status(200).json({
      message: "Category  updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update category name",
      error: error.message,
    });
  }
});

export const deleteCategoryWthPics = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category Not Found" });
    }

    for (const typeObj of category.types) {
      for (const imageUrl of typeObj.uploaded_Pictures) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    await category.deleteOne();

    return res
      .status(200)
      .json({ message: "Category with All Images Delete Succesfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Delete Category",
      error: error.message,
    });
  }
});

export const deleteSingleImage = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { imageUrl } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category Not Found" });
    }

    let imageFound = false;

    for (const type of category.types) {
      const index = type.uploaded_Pictures.indexOf(imageUrl);
      if (index !== -1) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        type.uploaded_Pictures.splice(index, 1);
        imageFound = true;
        break;
      }
    }
    if (!imageFound) {
      return res
        .status(400)
        .json({ message: "Image not found in this category" });
    }

    await category.save();

    return res.status(200).json({ message: "Image Deleted Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete image",
      error: error.message,
    });
  }
});

export const getTotalPictues = asyncHandler(async (req, res) => {
  try {
    const result = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalPictures: { $sum: "$totalUploadPics" },
        },
      },
    ]);

    const total = result[0]?.totalPictures || 0;
    return res.status(200).json({ totalPictures: total });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Image not found in this category" });
  }
});

export const getCategorySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "No category found" });
    }

    return res.status(200).json({ status: true, allDetail: category });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete image",
      error: error.message,
    });
  }
});
