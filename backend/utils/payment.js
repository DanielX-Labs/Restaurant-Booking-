import crypto from "node:crypto";
import QRCode from "qrcode";

const token = (bytes = 6) => crypto.randomBytes(bytes).toString("hex").toUpperCase();
export const createPaymentMetadata = (type) => {
  const year = new Date().getFullYear();
  const prefix = type === "booking" ? "BKG" : "ORD";
  return {
    paymentMethod: "Pay at Restaurant",
    paymentStatus: "Payment Pending",
    paymentReference: `REST-${year}-${token(5)}`,
    receiptNumber: `RCP-${prefix}-${year}-${token(4)}`,
    qrCodeReference: `QR-${prefix}-${token(12)}`,
  };
};

export const ensurePaymentMetadata = async (record, type) => {
  if (!record.paymentReference || !record.receiptNumber || !record.qrCodeReference) {
    Object.assign(record, createPaymentMetadata(type));
    await record.save();
  }
  return record;
};

export const paymentQrValue = (qrCodeReference) => `RESTAURANT_PAYMENT:${qrCodeReference}`;
export const createQrDataUrl = (qrCodeReference) => QRCode.toDataURL(paymentQrValue(qrCodeReference), { width: 320, margin: 2, errorCorrectionLevel: "M" });
