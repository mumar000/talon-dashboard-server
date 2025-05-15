import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

const handleUploadError = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      message: "Too many file uploads, Please check the limits",
    });
  } else {
    // Handle other Multer errors
    return res.status(500).json({
      message: err.message || "An unexpected error occurred during the upload.",
    });
  }
};

export default handleUploadError;
export const uploadMultiple = upload.array("files", 70);
