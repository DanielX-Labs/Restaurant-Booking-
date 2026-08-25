import express from "express";
import {
  adminLogin,
  getProfile,
  isAuth,
  isAdminAuth,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import upload from "../middlewares/multer.js";
const authRoutes = express.Router();

const authLimiter = rateLimit({ limit: 10 });
authRoutes.post("/register", authLimiter, registerUser);
authRoutes.post("/login", authLimiter, loginUser);
authRoutes.post("/admin/login", authLimiter, adminLogin);
authRoutes.post("/forgot-password", authLimiter, requestPasswordReset);
authRoutes.post("/reset-password/:token", authLimiter, resetPassword);
authRoutes.get("/verify-email/:token", verifyEmail);
authRoutes.post("/logout", logoutUser);
authRoutes.get("/profile", protect, getProfile);
authRoutes.get("/is-auth", protect, isAuth);
authRoutes.put("/profile", protect, updateProfile);
authRoutes.get("/admin/is-auth", adminOnly, isAdminAuth);
authRoutes.get("/admin/profile", adminOnly, getAdminProfile);
authRoutes.put("/admin/profile", adminOnly, upload.single("image"), updateAdminProfile);

export default authRoutes;
