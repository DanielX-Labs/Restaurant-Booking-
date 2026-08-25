import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { confirmPayment, getReceipt, searchPayments } from "../controllers/paymentController.js";

const paymentRoutes = express.Router();
paymentRoutes.get("/receipt/:type/:id", protect, getReceipt);
paymentRoutes.get("/search", adminOnly, searchPayments);
paymentRoutes.put("/confirm/:type/:id", adminOnly, confirmPayment);

export default paymentRoutes;
