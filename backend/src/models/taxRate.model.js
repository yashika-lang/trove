import mongoose from "mongoose";

const taxRateSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    cgst: {
      type: Number,
      required: true,
      min: 0,
    },

    sgst: {
      type: Number,
      required: true,
      min: 0,
    },

    igst: {
      type: Number,
      required: true,
      min: 0,
    },

    label: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
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

taxRateSchema.index(
  {
    company: 1,
    rate: 1,
  },
  {
    unique: true,
  }
);

const TaxRate = mongoose.model(
  "TaxRate",
  taxRateSchema
);

export default TaxRate;