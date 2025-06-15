import mongoose from "mongoose";

const SavedPictureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pictureUrl: [
    {
      type: String,
      required: true,
    },
  ],
  originalBulkUpload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BulkUpload",
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
  //   type: {
  //     type: String,
  //     required: false,
  //   },
  savedAt: {
    type: Date,
    default: Date.now(),
  },
});

const SavedPicture = mongoose.model("SavedPicture", SavedPictureSchema);
export default SavedPicture;
