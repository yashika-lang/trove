import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paymentDate: {
      type: Date,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "WALLET",
        "BANK_TRANSFER",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PAID",
        "PARTIALLY_PAID",
        "PENDING",
        "FAILED",
        "REFUNDED",
      ],
      default: "PAID",
    },

    utr: {
      type: String,
      trim: true,
      default: null,
    },

    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: null,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Payment numbers (PAY-0001...) are only meant to be unique within a
// company, not globally — a global unique index on paymentNumber alone
// meant the second company to ever reach "PAY-0003" would be permanently
// blocked from creating it, since generatePaymentNumber() (payment.service.js)
// only checks the current company's own last payment.
paymentSchema.index({ company: 1, paymentNumber: 1 }, { unique: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;