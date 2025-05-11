import { uploadBulkPictures } from "../controllers/bulkUploadController.js";
import handleUploadError, { uploadMultiple } from "../middleware/uploadMiddleware.js";
import express from 'express'
const router = express.Router()

router.post('/upload-pictures',handleUploadError, uploadMultiple, uploadBulkPictures)

export default router