import asyncHandler from "express-async-handler";
// import { Category, bulkUpload } from "../models/bulkUploadModel.js";
import { Category } from "../models/bulkUploadModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import User from "../models/userModel.js";
import {
  deleteFromCloudinary,
  extractPublicId,
} from "../services/cloudinary.js";
import pLimit from "p-limit";

// export const addCategory = asyncHandler(async (req, res) => {
//   try {
//     const { name } = req.body;

//     const existCategory = Category.findOne({ name });

//     if (existCategory) {
//       return res.status(400).json({ message: "Category Already Exists" });
//     }
//     const newCategory = new Category({ name });
//     await newCategory.save();

//     return res.status(201).json({
//       message: "Category Created Successfully",
//       category: newCategory,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// export const getCategories = asyncHandler(async (req, res) => {
//   try {
//     const allCategories = await Category.find().sort({ createdAt: -1 });
//     return res
//       .status(200)
//       .json({ message: "Categories", categories: allCategories });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// });

// export const updateCategory = asyncHandler(async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const category = await Category.findById(categoryId);

//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // Update the name if provided
//     category.name = req.body.name || category.name;

//     const updatedCategory = await category.save();

//     return res.status(200).json({
//       message: "Category updated successfully",
//       name: updatedCategory.name,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// export const deleteCategories = asyncHandler(async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const deleteCategory = await bulkUpload.findByIdAndDelete(categoryId);
//     return res.status(200).json({
//       message: "Category Delete Successfully",
//       delete: deleteCategory,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// export const uploadBulkPictures = asyncHandler(async (req, res) => {
//   try {
//     const files = req.files;
//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: "No File Uploaded" });
//     }

//     const { category, type } = req.body;

//     // const category = await Category.findOne({ categoryId });
//     const limit = pLimit(5);
//     const uploadPromises = files.map((file) =>
//       limit(async () => {
//         return uploadToCloudinary(file.buffer, "bulk_uploads");
//       })
//     );

//     const uploadedUrls = await Promise.all(uploadPromises);
//     const existingDoc = await bulkUpload.findOne({ category });

//     if (existingDoc) {
//       existingDoc.uploaded_Pictures.push(...uploadedUrls);
//       await existingDoc.save();
//     } else {
//       const uploadedPic = new bulkUpload({
//         category,
//         type,
//         uploaded_Pictures: uploadedUrls,
//       });

//       await uploadedPic.save();
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Pictures Uploaded Successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// export const getPicturesByCategory = asyncHandler(async (req, res) => {
//   try {
//     const { category } = req.params;
//     if (!category) {
//       return res.status(400).json({
//         status: false,
//         message: "Category is required",
//       });
//     }

//     const pictures = await bulkUpload
//       .find({ category: category })
//       .sort({ createdAt: -1 });

//     if (pictures.length > 0) {
//       const allPictures = pictures.flatMap((doc) => doc.uploaded_Pictures);

//       const bulkUploadId = pictures[0]._id;
//       return res.status(200).json({
//         status: true,
//         message: `All Pictures of Category: ${category}`,
//         bulkUploadId,
//         pictures: allPictures,
//       });
//     } else {
//       return res
//         .status(404)
//         .json({ message: "Not picture found in this category" });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// export const getAllPictures = asyncHandler(async (req, res) => {
//   const allPictures = await bulkUpload
//     .find()
//     .populate("category", "name")
//     .sort({ createdAt: -1 });
//   if (allPictures) {
//     res.status(200).json({
//       messaage: "All Categories",
//       allPictures,
//     });
//   } else {
//     res.status(500).json({
//       message: "Error Findind data",
//     });
//   }
// });

export const addCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(400).json({ message: "Category Already Exists" });
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

export const uploadPictures = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ messgae: "Please Upload Files" });
    }

    const { categoryId, type } = req.body;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(400).json({ message: "Category Not Found" });
    const limit = pLimit(10);

    const uploadPromises = files.map((file) =>
      limit(async () => {
        return uploadToCloudinary(file.buffer, "bulk_uploads");
      })
    );

    const uploaded_Pictures = await Promise.all(uploadPromises);
    category.totalUploadPics =
      (category.totalUploadPics || 0) + uploaded_Pictures.length;
    const existingType = category.types.find((t) => t.type === type);

    if (existingType) {
      existingType.uploaded_Pictures.push(...uploaded_Pictures);
    } else {
      category.types.push({ type, uploaded_Pictures });
    }
    await category.save();

    return res
      .status(201)
      .json({ message: "Pictures Uploaded Sucessfully", category });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
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

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check for duplicate name (optional but good practice)
    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    category.name = name;
    await category.save();

    res.status(200).json({
      message: "Category name updated successfully",
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
