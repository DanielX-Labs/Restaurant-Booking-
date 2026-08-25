import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true, maxlength: 80, default: "Administrator" },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  title: { type: String, trim: true, maxlength: 80, default: "Restaurant Administrator" },
  image: { type: String, trim: true, default: "" },
  imagePublicId: { type: String, trim: true, default: "" },
}, { timestamps: true });

export default mongoose.model("AdminProfile", adminProfileSchema);
