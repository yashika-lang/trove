import mongoose from "mongoose";

const hsnSacSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["HSN", "SAC"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    uqc: {
      type: String,
      trim: true,
    },

    gstRate: {
      type: Number,
      required: true,
      min: 0,
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

hsnSacSchema.index(
  {
    company: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

const HsnSac = mongoose.model(
  "HsnSac",
  hsnSacSchema
);

export default HsnSac;