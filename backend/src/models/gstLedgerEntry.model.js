import mongoose from "mongoose";

const gstLedgerEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "INPUT_CGST",
        "INPUT_SGST",
        "INPUT_IGST",
        "GST_PAYMENT",
      ],
      required: true,
    },

    particular: {
      type: String,
      required: true,
      trim: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },

    account: {
      type: String,
      enum: [
        "CGST",
        "SGST",
        "IGST",
        "ELECTRONIC_CASH",
      ],
      required: true,
    },

    debit: {
      type: Number,
      default: 0,
      min: 0,
    },

    credit: {
      type: Number,
      default: 0,
      min: 0,
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
      index: true,
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

const GSTLedgerEntry = mongoose.model(
  "GSTLedgerEntry",
  gstLedgerEntrySchema
);

export default GSTLedgerEntry;