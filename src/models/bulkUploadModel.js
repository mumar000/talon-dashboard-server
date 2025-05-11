import mongoose from "mongoose";

const bulkUploadSchema = mongoose.Schema(
  {
    category: { type: String },
    type: { type: String},
    uploaded_Pictures: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);

const bulkUpload = mongoose.model('BulkUpload',bulkUploadSchema)
export default bulkUpload


 