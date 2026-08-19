import mongoose from "mongoose";

const gstReconciliationSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    gstin: {
      type: String,
      trim: true,
      uppercase: true,
    },

    period: {
      type: String,
      required: true,
      trim: true,
    },

    booksTaxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    portalTaxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    booksTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    portalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    difference: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "MATCHED",
        "VALUE_MISMATCH",
        "MISSING_IN_BOOKS",
        "MISSING_IN_2B",
      ],
      required: true,
    },

    matchedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
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

gstReconciliationSchema.index({
  company: 1,
  period: 1,
});

gstReconciliationSchema.index({
  company: 1,
  status: 1,
});

gstReconciliationSchema.index({
  company: 1,
  documentNumber: 1,
});

const GSTReconciliation = mongoose.model(
  "GSTReconciliation",
  gstReconciliationSchema
);

export default GSTReconciliation;