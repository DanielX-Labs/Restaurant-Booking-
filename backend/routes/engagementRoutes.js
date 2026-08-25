import express from "express";
import { sendContact, subscribe } from "../controllers/engagementController.js";
import { rateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();
const limiter = rateLimit({ limit: 5, windowMs: 60 * 60 * 1000 });
router.post("/contact", limiter, sendContact);
router.post("/subscribe", limiter, subscribe);
export default router;
