import mongoose from "mongoose";

const itcSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GSTTransaction",
      required: true,
    },

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

    cgstAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgstAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },

    igstAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },

    cessAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },

    claimed: {
      type: Number,
      default: 0,
      min: 0,
    },

    reversed: {
      type: Number,
      default: 0,
      min: 0,
    },

    eligibility: {
      type: String,
      enum: [
        "ELIGIBLE",
        "BLOCKED",
        "PENDING",
      ],
      default: "PENDING",
    },

    eligibilityReason: {
      type: String,
      trim: true,
    },

    claimStatus: {
      type: String,
      enum: [
        "AVAILABLE",
        "CLAIMED",
        "PARTIALLY_CLAIMED",
        "REVERSED",
      ],
      default: "AVAILABLE",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

itcSchema.virtual("netCredit").get(function () {
  return (
    this.claimed -
    this.reversed
  );
});

itcSchema.set("toJSON", {
  virtuals: true,
});

const ITC = mongoose.model(
  "ITC",
  itcSchema
);

export default ITC;