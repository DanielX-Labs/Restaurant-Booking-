import mongoose from "mongoose";
const orderSchema=new mongoose.Schema({
 user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
   items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
      status: {
      type: String,
      enum: ["Pending", "Preparing", "Delivered", "Cancelled"],
      default: "Pending",
    },
     paymentMethod: {
      type: String,
      enum: ["Pay at Restaurant"],
      default: "Pay at Restaurant",
    },
    paymentStatus: { type: String, enum: ["Payment Pending", "Paid"], default: "Payment Pending", index: true },
    paymentReference: { type: String, unique: true, sparse: true, index: true },
    receiptNumber: { type: String, unique: true, sparse: true, index: true },
    qrCodeReference: { type: String, unique: true, sparse: true, index: true },
    paymentConfirmedAt: { type: Date },
    paymentConfirmedBy: { type: String },
    paymentAmount: { type: Number },
},{timestamps:true});

const Order=mongoose.model("Order",orderSchema);
export default Order;
