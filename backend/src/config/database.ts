import mongoose from "mongoose";
import { MONGODB_URI } from "../configs/constant.js";

export async function connectToMongoDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle mongoose connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error after initial connection:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to application termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.error("Critical Failure: Exiting process because database is unreachable.");
    process.exit(1); // Never continue silently
  }
}
