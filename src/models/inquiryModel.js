import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema(
  {
    areaOfInterest: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // validate: {
      //   validator: (email) => {
      //     return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      //   },
      //   message: "Please enter a valid email address",
      // },
    },
    phone: {
      type: String,
      trim: true,
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Inquiry = mongoose.model("Inquiry", InquirySchema);
export default Inquiry;
