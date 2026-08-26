import mongoose from "mongoose";

const bankTransactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      trim: true,
    },

    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
    },

    transactionDate: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    narration: {
      type: String,
      required: true,
      trim: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    reconciliationStatus: {
      type: String,
      enum: ["UNRECONCILED", "RECONCILED"],
      default: "UNRECONCILED",
    },

    // The bank's currentBalance immediately after this transaction was
    // applied — stored once, at write time, so the dashboard can display an
    // accurate running balance per row regardless of filters/pagination
    // (previously recomputed by walking backward from the bank's *current*
    // balance across whatever transactions happened to be on the current
    // filtered/paginated page, which was only correct for an unfiltered,
    // first-page, chronological view).
    balanceAfterTransaction: {
      type: Number,
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

// Scoped per company — transactionNumber (BT-0001...) is only meant to be
// unique within a company, not globally (same class of bug fixed earlier
// for Payment.paymentNumber).
bankTransactionSchema.index(
  { company: 1, transactionNumber: 1 },
  { unique: true }
);

const BankTransaction = mongoose.model(
  "BankTransaction",
  bankTransactionSchema
);

export default BankTransaction;