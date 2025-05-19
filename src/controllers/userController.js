import asyncHandler from "express-async-handler";
import generateToken from "../../utils/generateToken.js";
import User from "../models/userModel.js";
import Inquiry from "../models/inquiryModel.js";

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
    const user = await User.findById(req.user._id);

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
