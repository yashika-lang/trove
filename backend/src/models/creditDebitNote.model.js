import mongoose from "mongoose";

const noteItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const creditDebitNoteSchema = new mongoose.Schema(
  {
    noteNumber: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["CREDIT_NOTE", "DEBIT_NOTE"],
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    reason: { type: String, required: true, trim: true },

    items: {
      type: [noteItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one item is required.",
      },
    },

    subtotal: { type: Number, required: true, min: 0 },
    cgst: { type: Number, required: true, min: 0, default: 0 },
    sgst: { type: Number, required: true, min: 0, default: 0 },
    igst: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["ISSUED", "CANCELLED"],
      default: "ISSUED",
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
  { timestamps: true }
);

const CreditDebitNote = mongoose.model("CreditDebitNote", creditDebitNoteSchema);

export default CreditDebitNote;
