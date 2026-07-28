import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || "8080";
export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/fittrack";
export const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

export const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:3000";

export const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
export const KHALTI_BASE_URL =
  process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";
