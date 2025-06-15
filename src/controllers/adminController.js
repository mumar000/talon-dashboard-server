import generateToken from "../../utils/generateToken.js";
import Admin from "../models/adminModel.js";
import sendEmail from "../../utils/emailService.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
// @desc    Authenticate user and set JWT token
// @route   POST /api/admin/auth
//  @access  Public
export const authAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select("+role");

    if (admin && (await admin.matchPassword(password))) {
      generateToken(res, admin._id);
      res.status(201).json({
        message: "Login Successfully",
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
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

export const inviteAdmin = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Request", req.body);
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Email Already Registered" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
    });

    generateToken(res, admin._id);

    const inviteLink = "talon-admindashboard.netlify.app";

    await sendEmail({
      to: email,
      subject: "You have been invited to the Admin Dashboard",
      html: `
      <!DOCTYPE html>
      <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Dashboard Invitation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
          color: #2c3e50;
        }
        .email-container {
          max-width: 600px;
          margin: auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #1e293b;
          padding: 20px;
          text-align: center;
        }
        .header img {
          height: 50px;
        }
        .content {
          padding: 30px;
        }
        .content h2 {
          color: #1e293b;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
        }
        .credentials {
          background-color: #f1f5f9;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-family: monospace;
        }
        .button {
          display: inline-block;
          padding: 12px 20px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f9fafb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://taloninternational.com/wp-content/themes/talon/assets/build/images/footer-logo.png" alt="Talon Logo" />
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>You’ve been invited to access the admin dashboard.</p>
          <p>Here are your login credentials:</p>
          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>Click the button below to log in:</p>
          <p><a class="button" href="${inviteLink}">Access Dashboard</a></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Talon International. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `,
    });

    return res.status(201).json({
      message: "Registered Successfully",
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "Admin",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// @desc    profile of admin
// @route   GET /api/admin/profile
//  @access  Private
export const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.admin.id;
    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(404).json({ message: "No admin Found" });
    }
    res.status(200).json({
      status: true,
      message: "Admin Profile",
      admin,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
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

export const updateAvatar = asyncHandler(async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);

    const avatarUrl = await uploadToCloudinary(
      req.file.buffer,
      "profile-pictures"
    );

    admin.avatar = avatarUrl;
    await admin.save();
    return res.status(200).json({
      message: "Profile Picture updated successfully",
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.countDocuments();
    if (allUsers === 0) {
      res.status(400).send({ message: "No User found" });
    }
    return res.status(200).send({
      message: "Total Users",
      allUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
