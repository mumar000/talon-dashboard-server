import mongoose from "mongoose";

const mainBannerSchema = mongoose.Schema(
  {
    heading: { type: String, required: true },
    subHeading: { type: String, required: true },
    bannerPicture: { type: String, required: true },
  },
  { timestamps: true }
);

const MainBanner = mongoose.model("MainBanner", mainBannerSchema);
export default MainBanner;
