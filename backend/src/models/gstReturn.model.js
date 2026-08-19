import mongoose from "mongoose";

const gstReturnSchema = new mongoose.Schema(
  {
    returnType: {
      type: String,
      enum: [
        "GSTR-1",
        "GSTR-3B",
        "GSTR-9",
      ],
      required: true,
    },

    period: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    liability: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PREPARED",
        "APPROVED",
        "FILED",
        "PAID",
        "PENDING",
      ],
      default: "DRAFT",
    },

    filedAt: {
      type: Date,
    },

    filingReference: {
      type: String,
      trim: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

gstReturnSchema.index({
  company: 1,
  returnType: 1,
  period: 1,
});

const GSTReturn = mongoose.model(
  "GSTReturn",
  gstReturnSchema
);

export default GSTReturn;