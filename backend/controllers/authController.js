import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { mailConfigured, queueMail } from "../utils/mailer.js";
import AdminProfile from "../models/adminProfileModel.js";
import { deleteImage, uploadImage } from "../utils/images.js";
import { unlink } from "node:fs/promises";
// Generate JWT
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
});
const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, cookieOptions());
  return token;
};

const getOrCreateAdminProfile = () => AdminProfile.findOneAndUpdate(
  { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
  { $setOnInsert: { email: process.env.ADMIN_EMAIL.trim().toLowerCase(), name: "Administrator", title: "Restaurant Administrator" } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
).lean();

export const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return res.status(400).json({ message: "Use a valid email and a password of at least 8 characters", success: false });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({ name, email, password: hashedPassword, emailVerified: !mailConfigured(), emailVerificationToken: mailConfigured() ? crypto.createHash("sha256").update(rawToken).digest("hex") : undefined });
    if (mailConfigured()) {
      const url = `${process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173"}/verify-email/${rawToken}`;
      queueMail({ to: email, subject: "Verify your email", text: `Verify your restaurant account: ${url}` });
    }
    return res.status(201).json({ message: mailConfigured() ? "Registered. Check your email to verify your account." : "User registered successfully", success: true });
  } catch (error) {
    console.error(`[AUTH] REGISTER failed email=${req.body.email || "unknown"} message="${error.message}"`);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    generateToken(res, { id: user._id, role: user.isAdmin ? "admin" : "user" });
    res.json({
      message: "User logged in successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, cookieOptions());

    const admin = await getOrCreateAdminProfile();
    return res.json({
      success: true,
      message: "Admin logged in successfully",
      admin,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions());
    return res.json({ message: "User logged out successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const isAuth = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const isAdminAuth = async (req, res) => {
  const admin = await getOrCreateAdminProfile();
  res.json({ success: true, admin });
};

export const getAdminProfile = async (_req, res) => {
  try {
    const admin = await getOrCreateAdminProfile();
    res.json({ success: true, admin });
  } catch (error) {
    console.error(`[ADMIN] PROFILE read failed message="${error.message}"`);
    res.status(500).json({ success: false, message: "Unable to load admin profile" });
  }
};

export const updateAdminProfile = async (req, res) => {
  let uploadedImage;
  try {
    const name = req.body.name?.trim();
    const phone = req.body.phone?.trim() || "";
    const title = req.body.title?.trim();
    if (!name || !title) return res.status(400).json({ success: false, message: "Name and title are required" });
    if (name.length > 80 || title.length > 80 || phone.length > 30) return res.status(400).json({ success: false, message: "One or more profile fields are too long" });
    const currentAdmin = await AdminProfile.findOne({ email: req.admin.email });
    if (req.file) uploadedImage = await uploadImage(req.file.path);
    const updates = { name, phone, title };
    if (uploadedImage) {
      updates.image = uploadedImage.secure_url;
      updates.imagePublicId = uploadedImage.public_id;
    }
    const admin = await AdminProfile.findOneAndUpdate(
      { email: req.admin.email },
      { $set: updates },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    if (uploadedImage && currentAdmin?.imagePublicId) await deleteImage(currentAdmin.imagePublicId);
    res.json({ success: true, message: "Admin profile updated", admin });
  } catch (error) {
    if (req.file?.path) await unlink(req.file.path).catch(() => undefined);
    if (uploadedImage?.public_id) await deleteImage(uploadedImage.public_id);
    console.error(`[ADMIN] PROFILE update failed message="${error.message}"`);
    res.status(500).json({ success: false, message: "Unable to update admin profile" });
  }
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const name = req.body.name?.trim();
  if (name) user.name = name;
  if (req.body.newPassword) {
    if (!req.body.currentPassword || !(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }
    if (req.body.newPassword.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    user.password = await bcrypt.hash(req.body.newPassword, 10);
  }
  await user.save();
  res.json({ success: true, message: "Profile updated", user: { name: user.name, email: user.email } });
};

export const requestPasswordReset = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user && mailConfigured()) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    const url = `${process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173"}/reset-password/${rawToken}`;
    queueMail({ to: email, subject: "Reset your password", text: `Reset your password within 30 minutes: ${url}` });
  }
  res.json({ success: true, message: mailConfigured() ? "If that account exists, a reset link has been sent." : "Email delivery is not configured. Contact the administrator." });
};

export const resetPassword = async (req, res) => {
  if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: "Reset link is invalid or expired" });
  user.password = await bcrypt.hash(req.body.password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successfully" });
};

export const verifyEmail = async (req, res) => {
  const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) return res.status(400).json({ success: false, message: "Verification link is invalid" });
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
  res.json({ success: true, message: "Email verified" });
};
