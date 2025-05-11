import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: "dnqyypaff",
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadtoCloudinary = async (file) => {
  try {
    const result =  await cloudinary.uploader.upload(file.path, {
      folder:'bulk_uploads',
      resource_type:'auto',

    })
    return result.secure_url
  } catch (error) {
    console.log("Error Uploading to Cloudinary", error)
    throw error
  }
}
export default cloudinary



