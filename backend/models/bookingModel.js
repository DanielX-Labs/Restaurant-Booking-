import mongoose from "mongoose";
const bookingSchema=new mongoose.Schema({
user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     name: {
      type: String,
      required: true,
    },
     phone: {
      type: String,
      required: true,
    },
     email: { type: String, trim: true, lowercase: true },
     numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
      date: {
      type: String,
      required: true,
    },
  time: {
      type: String,
      required: true,
    },
     note: {
      type: String,
      default: "",
    },
     status: {
      type: String,
      enum: ["Pending", "Approved", "Cancelled"],
      default: "Pending",
    },
    totalAmount: { type: Number, min: 0, default: 0 },
    paymentMethod: { type: String, enum: ["Pay at Restaurant"], default: "Pay at Restaurant" },
    paymentStatus: { type: String, enum: ["Payment Pending", "Paid"], default: "Payment Pending", index: true },
    paymentReference: { type: String, unique: true, sparse: true, index: true },
    receiptNumber: { type: String, unique: true, sparse: true, index: true },
    qrCodeReference: { type: String, unique: true, sparse: true, index: true },
    paymentConfirmedAt: { type: Date },
    paymentConfirmedBy: { type: String },
    paymentAmount: { type: Number },
},{timestamps:true});

const Booking=mongoose.model("Booking",bookingSchema);
export default Booking;
