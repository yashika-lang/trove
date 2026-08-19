import mongoose from "mongoose";

const bankTransactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
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

const BankTransaction = mongoose.model(
  "BankTransaction",
  bankTransactionSchema
);

export default BankTransaction;