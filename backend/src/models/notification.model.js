import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "INVOICE_CREATED",
        "PAYMENT_RECEIVED",
        "QUOTATION_APPROVED",
        "BANK_IMPORT_COMPLETED",
        "TRANSACTION_RECONCILED",
        "GST_RETURN_FILED",
        "ITC_REVERSED",
        "RECONCILIATION_MISMATCH",
        "GENERAL",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
