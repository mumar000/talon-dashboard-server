import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const bulkUploadSchema = mongoose.Schema(
  {
    category: { type: String },
    type: { type: String },
    uploaded_Pictures: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);

export const bulkUpload = mongoose.model("bulkUpload", bulkUploadSchema);
export const Category = mongoose.model("Category", categorySchema);
