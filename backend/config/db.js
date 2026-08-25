import mongoose from "mongoose";
export const connectDB = async () => {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not configured");
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10_000 });
  console.log("Database connected");
};
