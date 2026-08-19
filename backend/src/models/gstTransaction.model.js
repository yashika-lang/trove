import mongoose from "mongoose";

const gstTransactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    documentType: {
      type: String,
      enum: [
        "INVOICE",
        "PURCHASE",
        "CREDIT_NOTE",
        "DEBIT_NOTE",
      ],
      required: true,
    },

    type: {
      type: String,
      enum: ["OUTWARD", "INWARD"],
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    supplierName: {
      type: String,
      trim: true,
    },

    gstin: {
      type: String,
      trim: true,
      uppercase: true,
    },

    placeOfSupply: {
      type: String,
      trim: true,
    },

    taxRate: {
      type: Number,
      required: true,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    cgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    igst: {
      type: Number,
      default: 0,
      min: 0,
    },

    cess: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "GENERATED",
        "PENDING",
        "FILED",
        "CANCELLED",
      ],
      default: "GENERATED",
    },

    source: {
      type: String,
      enum: [
        "INVOICE",
        "PURCHASE",
        "MANUAL",
        "CREDIT_NOTE",
        "DEBIT_NOTE",
      ],
      default: "MANUAL",
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
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

gstTransactionSchema.index({
  company: 1,
  date: -1,
});

gstTransactionSchema.index({
  company: 1,
  documentNumber: 1,
});

gstTransactionSchema.index({
  company: 1,
  gstin: 1,
});

gstTransactionSchema.index({
  company: 1,
  type: 1,
});

const GSTTransaction = mongoose.model(
  "GSTTransaction",
  gstTransactionSchema
);

export default GSTTransaction;