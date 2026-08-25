import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";
import { createPaymentMetadata, ensurePaymentMetadata } from "../utils/payment.js";
import { queueMail } from "../utils/mailer.js";

export const placeOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const address = req.body.address?.trim();
    if (!address)
      return res
        .status(400)
        .json({ message: "Delivery address is required", success: false });

    const cart = await Cart.findOne({ user: id }).populate("items.menuItem");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    if (cart.items.some((item) => !item.menuItem || !item.menuItem.isAvailable)) {
      return res.status(400).json({ message: "Your cart contains deleted or unavailable items", success: false });
    }
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      user: id,
      items: cart.items.map((i) => ({
        menuItem: i.menuItem._id,
        quantity: i.quantity,
      })),
      totalAmount,
      address,
      ...createPaymentMetadata("order"),
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    const customer = await User.findById(id).select("name email").lean();
    if (customer?.email) {
      const receiptUrl = `${process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173"}/receipt/order/${newOrder._id}`;
      queueMail({ to: customer.email, subject: `Order receipt ${newOrder.receiptNumber}`, text: `Hello ${customer.name},\n\nYour order was created successfully. No online payment is required. Payment must be made physically at the restaurant.\n\nOrder ID: ${newOrder._id}\nPayment reference: ${newOrder.paymentReference}\nAmount due: NGN ${totalAmount}\nPayment status: Payment Pending\nReceipt: ${receiptUrl}\n\nPresent your receipt or QR code at the restaurant to complete payment.` });
    }

    res.status(201).json({
      success: true,
      message: "Order successful. Your payment receipt has been generated. Please present it at the restaurant when making payment.",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ user: id }).populate("items.menuItem", "name image price").sort({ createdAt: -1 });
    await Promise.all(orders.map((order) => ensurePaymentMetadata(order, "order")));
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });
    await Promise.all(orders.map((order) => ensurePaymentMetadata(order, "order")));
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!["Pending", "Preparing", "Delivered"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "Delivered") {
      return res.status(409).json({ success: false, message: "Delivered orders are final and cannot be updated" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "order status updated", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const cancelUserOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.status !== "Pending") return res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
  order.status = "Cancelled";
  await order.save();
  res.json({ success: true, message: "Order cancelled", order });
};
