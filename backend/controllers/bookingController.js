import Booking from "../models/bookingModel.js";
import { createPaymentMetadata, ensurePaymentMetadata } from "../utils/payment.js";
import { queueMail } from "../utils/mailer.js";
export const createBooking = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, phone, numberOfPeople, date, time, note } = req.body;
    if (!name || !phone || !numberOfPeople || !date || !time) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const bookingDate = new Date(`${date}T${time}`);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate <= new Date()) {
      return res.status(400).json({ message: "Booking must be for a future date and time", success: false });
    }
    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      date,
      time,
      status: { $ne: "Cancelled" },
    });
    if (existingBooking)
      return res
        .status(400)
        .json({ message: "This time slot is already booked", success: false });
    const booking = await Booking.create({
      user: id,
      name,
      phone,
      email,
      numberOfPeople,
      date,
      time,
      note,
      ...createPaymentMetadata("booking"),
    });
    if (email) {
      const receiptUrl = `${process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173"}/receipt/booking/${booking._id}`;
      queueMail({ to: email, subject: `Booking receipt ${booking.receiptNumber}`, text: `Hello ${name},\n\nYour reservation was created successfully. No online payment is required. Payment must be made physically at the restaurant.\n\nBooking ID: ${booking._id}\nPayment reference: ${booking.paymentReference}\nPayment status: Payment Pending\nReceipt: ${receiptUrl}\n\nPresent your receipt or QR code at the restaurant to complete payment.` });
    }
    res
      .status(201)
      .json({ success: true, message: "Booking successful. Your payment receipt has been generated. Please present it at the restaurant when making payment.", booking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { id } = req.user;
    const bookings = await Booking.find({ user: id }).sort({
      createdAt: -1,
    });
    await Promise.all(bookings.map((booking) => ensurePaymentMetadata(booking, "booking")));
    res.status(200).json({ bookings, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email");
    await Promise.all(bookings.map((booking) => ensurePaymentMetadata(booking, "booking")));
    res.status(200).json({ bookings, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { status } = req.body;
    if (!["Pending", "Approved", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    await booking.save();
    res
      .status(200)
      .json({ success: true, message: "Booking status updated", booking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const cancelUserBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user.id });
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  if (booking.status === "Cancelled") return res.status(400).json({ success: false, message: "Booking is already cancelled" });
  booking.status = "Cancelled";
  await booking.save();
  res.json({ success: true, message: "Booking cancelled", booking });
};
