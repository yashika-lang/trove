import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    quotationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        rate: {
          type: Number,
          required: true,
          min: 0,
        },

        gst: {
          type: Number,
          required: true,
          min: 0,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
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
  default: 0,
},

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SENT",
        "APPROVED",
        "REJECTED",
        "EXPIRED",
        "CONVERTED",
      ],
      default: "DRAFT",
    },

    notes: {
      type: String,
      trim: true,
    },

    termsAndConditions: {
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

    convertedInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
  },
  
  {
    timestamps: true,
  }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;