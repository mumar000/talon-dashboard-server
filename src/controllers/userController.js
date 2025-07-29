import asyncHandler from "express-async-handler";
import generateToken from "../../utils/generateToken.js";
import User from "../models/userModel.js";
// import { bulkUpload } from "../models/bulkUploadModel.js";
import SavedPicture from "../models/savedPictureModel.js";

import Inquiry from "../models/inquiryModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { Category } from "../models/bulkUploadModel.js";

// @desc    Authenticate user and set JWT token
// @route   POST /api/users/auth
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid Email and Password" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "User Already Registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }

  return res.status(200).json({ message: "Register User" });
});

// @desc    Logout User
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User Logged Out" });
});

//@desc     Get user Profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "No Profile Founded" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

//@desc     Update user Profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      return res.status(200).json({
        message: "User Profile Updated",
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      return res.status(404).json({ message: "User Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Inter Server Error",
      error: error.message,
    });
  }
});

//@desc     Update user Avatar
// @route   PUT /api/users/profile
// @access  Private
export const updateProfilePic = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User Not Found" });

    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      "profile-pictures"
    );

    user.profilePic = imageUrl;
    await user.save();
    return res
      .status(200)
      .json({ msg: "Profile Picture Updated", profilePic: imageUrl });
  } catch (error) {
    console.error("Error uploading profile picture:", error.message);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
});

//@desc     Submit Inquiry Form
// @route   POST /api/users/submitInquiry
// @access  Private
export const submitInquiry = asyncHandler(async (req, res) => {
  try {
    const { areaOfInterest, fullName, company, companyEmail, phone, comments } =
      req.body;

    if (!areaOfInterest || !fullName || !companyEmail) {
      return res.status(400).json({ message: "Required Fields are required" });
    }

    const newInquiry = await Inquiry.create({
      areaOfInterest,
      fullName,
      company,
      companyEmail,
      phone,
      comments,
    });

    res.status(201).json({
      message: "Inquiry created Successfully",
      inquiry: newInquiry,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

//@desc     Detail of all Inquiry Form
// @route   GET /api/users/getInquiry
// @access  Private
export const getInquiryForm = asyncHandler(async (req, res) => {
  try {
    const inquiryForm = await Inquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "All Inquiry Form", inquiryForm });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

//@desc    save picture for all user
// @route   POST /api/users/save-picture
// @access  Private
export const savingPicture = asyncHandler(async (req, res) => {
  try {
    const { pictureUrl, categoryId } = req.body;

    if (!req.user?._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not authenticated" });
    }
    const userId = req.user._id;

    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
      return res.status(404).json({ message: "Original document not found" });
    }

    for (const type of categoryDoc.types) {
      for (const image of type.uploaded_Pictures) {
        if (!type || !image) {
          return res.status(404).json({ message: "No Image Found" });
        }
      }
    }

    const savedDoc = await SavedPicture.findOne({
      user: userId,
      originalBulkUpload: categoryId,
    });

    if (savedDoc) {
      if (savedDoc.pictureUrl.includes(pictureUrl)) {
        return res.status(409).json({ message: "Picture Already Saved" });
      }

      savedDoc.pictureUrl.push(pictureUrl);
      await savedDoc.save();
      return res.status(200).json({
        message: "Picture added to saved List",
        data: savedDoc,
      });
    } else {
      const newSavedPicture = await SavedPicture.create({
        user: userId,
        pictureUrl: [pictureUrl],
        originalBulkUpload: categoryId,
        category: categoryDoc.name,
      });

      res.status(201).json({
        success: true,
        message: "Picture saved successfully",
        data: newSavedPicture,
      });
    }
  } catch (err) {
    console.error("Error saving picture:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export const unsavePicture = asyncHandler(async (req, res) => {
  try {
    const { pictureUrl, categoryId } = req.body;

    const cleanUrl = (url) => decodeURIComponent(url).split("?")[0];

    const savedDoc = await SavedPicture.findOne({
      originalBulkUpload: categoryId,
    });

    if (!savedDoc) {
      return res.status(400).json({ message: "Document Not Found" });
    }

    const incomingUrl = cleanUrl(pictureUrl);

    const exists = savedDoc.pictureUrl.some(
      (url) => cleanUrl(url) === incomingUrl
    );

    if (!exists) {
      return res.status(400).json({ message: "Picture Not Found" });
    }

    savedDoc.pictureUrl = savedDoc.pictureUrl.filter(
      (url) => cleanUrl(url) !== incomingUrl
    );

    await savedDoc.save();

    return res.status(200).json({ message: "Picture Unsave Successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

//@desc    get All pictures of all users
// @route   GET /api/users/getSavePics
// @access  Private
export const getSavedPictures = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const pictures = await SavedPicture.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (pictures.length === 0) {
      return res
        .status(404)
        .json({ message: "No Picture Found for this user" });
    }

    return res.status(200).json({
      status: true,
      message: "Saved Pictures of User",
      pictures,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});
