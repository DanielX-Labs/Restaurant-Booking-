import express from "express";

import { adminOnly, protect } from "../middlewares/authMiddleware.js";

import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/cartController.js";

const cartRoutes = express.Router();

cartRoutes.post("/add", protect, addToCart);
cartRoutes.get("/get", protect, getCart);
cartRoutes.delete("/remove/:menuId", protect, removeFromCart);
cartRoutes.put("/quantity/:menuId", protect, updateCartQuantity);
export default cartRoutes;
