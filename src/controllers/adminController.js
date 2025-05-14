import generateToken from "../../utils/generateToken.js";
import Admin from "../models/adminModel.js";
import asyncHandler from "express-async-handler";

// @desc    Authenticate user and set JWT token
// @route   POST /api/admin/auth
//  @access  Public
export const authAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      generateToken(res, admin._id);
      res.status(201).json({
        message: "Login Successfully",
        id: admin._id,
        name: admin.name,
        email: admin.email,
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

// @desc    register user and set JWT token
// @route   POST /api/admin/register
//  @access  Public

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400).json({ message: "Email Already Registered" });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  if (admin) {
    generateToken(res, admin._id);
    res.status(200).json({
      message: "Registered Successfully",
      id: admin._id,
      name: admin.name,
      email: admin.email,
    });
  } else {
    res.status(400).json({ message: "Internal Server Error" });
    throw new Error("Server Error");
  }
});

// @desc    profile of admin
// @route   GET /api/admin/profile
//  @access  Private
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: true,
    message: "User Profile",
    admin,
  });
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User Logged Out" });
});

// @desc    update admin
// @route   POST /api/admin/register
//  @access  Private
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    admin.name = req.body.name || req.name;
    admin.email = req.body.email || req.email;

    if (req.password) {
      admin.password = req.body.password;
    }

    const updatedUser = await admin.save();
    return res.status(200).json({
      message: "Profile Updated Succesfully",
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    return res.status(404).json({ message: "User Not Found" });
  }
});
