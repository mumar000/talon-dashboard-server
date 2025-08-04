import mongoose from "mongoose";

const typeSchema = mongoose.Schema({
  type: { type: String, required: true },
  uploaded_Pictures: [{ type: String, required: true }],
});

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    types: [typeSchema],
    totalUploadPics: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    cardImg: {
      type: String,
      required: true,
    },
    bannerImg: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// export const bulkUpload = mongoose.model("bulkUpload", bulkUploadSchema);
// export const Category = mongoose.model("Category", categorySchema);

export const Category = mongoose.model("Category", categorySchema);
