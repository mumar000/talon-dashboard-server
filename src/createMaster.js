// seedMaster.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/adminModel.js"; 
dotenv.config(); 

const seedMaster = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URL)
      .then(() => console.log("✅ MongoDB connected"))
      .catch((err) => console.error("❌ MongoDB error:", err));

    const masterExists = await Admin.findOne({ role: "Master" });
    if (masterExists) {
      console.log("⚠️ Master already exists:", masterExists.email);
      process.exit();
    }
    

    const master = await Admin.create({
      name: "Jonathan Burstein",
      email: "jb@twolightsmedia.com",
      password: "jb@admin1234!",
      role: "master",
    });

    console.log("✅ Master account created successfully!");
    console.log("📧 Email:", master.email);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding master:", error);
    process.exit(1);
  }
};

seedMaster();
