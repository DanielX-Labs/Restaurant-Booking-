import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import { createQrDataUrl, ensurePaymentMetadata } from "../utils/payment.js";
import { queueMail } from "../utils/mailer.js";

const models = { order: Order, booking: Booking };
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeReference = (value = "") => value.trim().replace(/^RESTAURANT_PAYMENT:/i, "");
const restaurant = () => ({
  name: process.env.RESTAURANT_NAME || "Restaurant",
  address: process.env.RESTAURANT_ADDRESS || "Visit the restaurant for payment",
  phone: process.env.RESTAURANT_PHONE || "",
  email: process.env.SUPPORT_EMAIL || "",
  logo: process.env.RESTAURANT_LOGO || "/logo.png",
  currency: process.env.CURRENCY || "NGN",
});

const populateRecord = (query, type) => type === "order"
  ? query.populate("user", "name email phone").populate("items.menuItem", "name price image")
  : query.populate("user", "name email phone");

const toPaymentResult = async (record, type, includeQr = false) => {
  await ensurePaymentMetadata(record, type);
  const customer = type === "order"
    ? { name: record.user?.name || "Customer", email: record.user?.email || "", phone: record.user?.phone || "" }
    : { name: record.name, email: record.email || record.user?.email || "", phone: record.phone };
  const result = {
    type,
    id: record._id,
    bookingOrderId: record._id,
    status: record.status,
    paymentMethod: record.paymentMethod,
    paymentStatus: record.paymentStatus,
    paymentReference: record.paymentReference,
    receiptNumber: record.receiptNumber,
    amount: record.totalAmount || 0,
    paymentConfirmedAt: record.paymentConfirmedAt,
    paymentConfirmedBy: record.paymentConfirmedBy,
    paymentAmount: record.paymentAmount,
    createdAt: record.createdAt,
    customer,
    details: type === "order"
      ? { address: record.address, items: record.items }
      : { date: record.date, time: record.time, guests: record.numberOfPeople, note: record.note },
  };
  if (includeQr) result.qrCode = await createQrDataUrl(record.qrCodeReference);
  return result;
};

export const getReceipt = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    if (!Model || !mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid receipt request" });
    const record = await populateRecord(Model.findOne({ _id: id, user: req.user.id }), type);
    if (!record) return res.status(404).json({ success: false, message: "Receipt not found" });
    res.json({ success: true, receipt: await toPaymentResult(record, type, true), restaurant: restaurant() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to load receipt" });
  }
};

export const searchPayments = async (req, res) => {
  try {
    const term = normalizeReference(req.query.q);
    if (term.length < 2) return res.status(400).json({ success: false, message: "Enter at least 2 characters" });
    const regex = new RegExp(escapeRegex(term), "i");
    const ids = mongoose.isValidObjectId(term) ? [{ _id: term }] : [];
    const referenceFilters = [{ paymentReference: regex }, { receiptNumber: regex }, { qrCodeReference: regex }];
    const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select("_id").limit(20).lean();
    const userIds = matchingUsers.map((user) => user._id);
    const orders = await populateRecord(Order.find({ $or: [...ids, ...referenceFilters, ...(userIds.length ? [{ user: { $in: userIds } }] : [])] }).sort({ createdAt: -1 }).limit(20), "order");
    const bookings = await populateRecord(Booking.find({ $or: [...ids, ...referenceFilters, { name: regex }, { email: regex }] }).sort({ createdAt: -1 }).limit(20), "booking");
    const results = await Promise.all([...orders.map((item) => toPaymentResult(item, "order")), ...bookings.map((item) => toPaymentResult(item, "booking"))]);
    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to search payments" });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    if (!Model || !mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid payment request" });
    const existing = await Model.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Booking or order not found" });
    if (existing.paymentStatus === "Paid") return res.status(409).json({ success: false, message: "This payment has already been confirmed." });
    const confirmedAt = new Date();
    const updated = await Model.findOneAndUpdate(
      { _id: id, paymentStatus: { $ne: "Paid" } },
      { $set: { paymentStatus: "Paid", paymentConfirmedAt: confirmedAt, paymentConfirmedBy: req.admin.email, paymentAmount: existing.totalAmount || 0 } },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(409).json({ success: false, message: "This payment has already been confirmed." });
    const record = await populateRecord(Model.findById(updated._id), type);
    const customerEmail = type === "order" ? record.user?.email : (record.email || record.user?.email);
    if (customerEmail) queueMail({ to: customerEmail, subject: `Payment confirmed - ${record.paymentReference}`, text: `Your payment of NGN ${record.totalAmount || 0} has been confirmed by the restaurant.\n\nReference: ${record.paymentReference}\nReceipt: ${(process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173")}/receipt/${type}/${record._id}` });
    res.json({ success: true, message: "Payment confirmed successfully.", payment: await toPaymentResult(record, type) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to confirm payment" });
  }
};
