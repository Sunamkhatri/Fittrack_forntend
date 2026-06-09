import mongoose from "mongoose";
import { MONGODB_URI } from "../configs/constant.js";

export async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.warn("Continuing without MongoDB - API health endpoint available");
  }
}
