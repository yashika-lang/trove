import mongoose from "mongoose";

const gstSettingsSchema = new mongoose.Schema(
  {
    legalName: {
      type: String,
      required: true,
      trim: true,
    },

    gstin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    stateCode: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    registrationType: {
      type: String,
      enum: [
        "REGULAR",
        "COMPOSITION",
        "CASUAL",
        "SEZ",
      ],
      default: "REGULAR",
    },

    filingFrequency: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY"],
      default: "MONTHLY",
    },

    compositionScheme: {
      type: Boolean,
      default: false,
    },

    eInvoicing: {
      type: Boolean,
      default: false,
    },

    reverseCharge: {
      type: Boolean,
      default: false,
    },

    autoReconcile2B: {
      type: Boolean,
      default: false,
    },

    eInvoiceThreshold: {
      type: Number,
      default: 50000000,
      min: 0,
    },

    eWayBillThreshold: {
      type: Number,
      default: 50000,
      min: 0,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const GSTSettings = mongoose.model(
  "GSTSettings",
  gstSettingsSchema
);

export default GSTSettings;