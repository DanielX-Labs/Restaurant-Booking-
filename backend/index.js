import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import engagementRoutes from "./routes/engagementRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectCloudinary();
const app = express();
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://resturant-app-peach.vercel.app",
  ...(process.env.CLIENT_URL || "").split(",").map((value) => value.trim()).filter(Boolean),
]);

app.disable("x-powered-by");
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const timestamp = new Date().toISOString();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const level = res.statusCode >= 500 ? "ERROR" : res.statusCode >= 400 ? "WARN" : "INFO";
    console.log(`[HTTP] ${level} ${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms ip=${req.ip}`);
  });
  next();
});
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ success: false, message: "Untrusted request origin" });
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.send("Restaurant API is running"));
app.get("/health", (_req, res) => res.json({ success: true }));
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/engagement", engagementRoutes);
app.use("/api/payment", paymentRoutes);
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((error, _req, res, _next) => {
  console.error(error.message);
  const badUpload = error.name === "MulterError" || error.message === "Only image files are allowed";
  res.status(badUpload ? 400 : 500).json({ success: false, message: badUpload ? error.message : "Internal server error" });
});

const PORT = process.env.PORT || 5000;
const validateConfig = () => {
  const missing = ["MONGO_URL", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
  if (process.env.ADMIN_PASSWORD.length < 12 || process.env.ADMIN_PASSWORD === "admin123") {
    throw new Error("ADMIN_PASSWORD must be a strong, non-default password of at least 12 characters");
  }
};
export const startServer = async () => {
  validateConfig();
  await connectDB();
  return app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

export default app;
