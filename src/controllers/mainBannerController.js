import asyncHandler from "express-async-handler";
import MainBanner from "../models/mainBannerModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";

// @desc    Create a new main banner
// @route   POST /api/banner
// @access  Private
export const createMainBanner = asyncHandler(async (req, res) => {
  try {
    const { heading, subHeading } = req.body;

    if (!heading || !subHeading) {
      res.status(400).json({ message: "Heading and Subheading are required" });
      return;
    }

    let bannerPicture = "";
    if (req.file) {
      bannerPicture = await uploadToCloudinary(req.file.buffer, "main-banner");
    }

    const newBanner = await MainBanner.create({
      heading,
      subHeading,
      bannerPicture,
    });

    res.status(201).json(newBanner);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", error });
  }
});

// @desc    Get all main banners
// @route   GET /api/banner
// @access  Public
export const getMainBanners = asyncHandler(async (req, res) => {
  try {
    const banners = await MainBanner.find({});
    res.status(200).json(banners);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", error });
  }
});

// @desc    Get a main banner by ID
// @route   GET /api/banner/:id
// @access  Public
export const getMainBannerById = asyncHandler(async (req, res) => {
  try {
    const banner = await MainBanner.findById(req.params.id);

    if (banner) {
      res.status(200).json(banner);
    } else {
      res.status(404).json({ message: "Banner not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", error });
  }
});

// @desc    Update a main banner
// @route   PUT /api/banner/:id
// @access  Private
export const updateMainBanner = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, subHeading } = req.body;

    const banner = await MainBanner.findById(id);

    if (!banner) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }

    banner.heading = heading || banner.heading;
    banner.subHeading = subHeading || banner.subHeading;

    if (req.file) {
      banner.bannerPicture = await uploadToCloudinary(
        req.file.buffer,
        "main-banner"
      );
    }

    const updatedBanner = await banner.save();

    res.status(200).json(updatedBanner);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// @desc    Delete a main banner
// @route   DELETE /api/banner/:id
// @access  Private
export const deleteMainBanner = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await MainBanner.findById(id);

    if (!banner) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }

    await banner.deleteOne();
    res.status(200).json({ message: "Banner removed" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", error });
  }
});
