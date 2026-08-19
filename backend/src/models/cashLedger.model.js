import mongoose from "mongoose";

const cashLedgerSchema = new mongoose.Schema(
  {
    // ========================================
    // TRANSACTION DATE
    // ========================================

    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },

    // ========================================
    // ENTRY TYPE
    // ========================================

    type: {
      type: String,
      enum: [
        "CASH_RECEIPT",
        "CASH_SALE",
        "CASH_EXPENSE",
        "CASH_PAYMENT",
        "CASH_DEPOSIT",
        "CASH_WITHDRAWAL",
        "OPENING_BALANCE",
      ],
      required: true,
      index: true,
    },

    // ========================================
    // REFERENCE
    // ========================================

    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },

    // ========================================
    // DESCRIPTION
    // ========================================

    description: {
      type: String,
      trim: true,
      required: true,
    },

    // ========================================
    // DEBIT / CREDIT
    // ========================================

    debit: {
      type: Number,
      min: 0,
      default: 0,
    },

    credit: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================
    // RUNNING BALANCE
    // ========================================

    balance: {
      type: Number,
      default: 0,
    },

    // ========================================
    // SOURCE
    // ========================================

    source: {
      type: {
        type: String,
        enum: [
          "PAYMENT",
          "INVOICE",
          "EXPENSE",
          "BANK_TRANSACTION",
          "MANUAL",
          "OPENING_BALANCE",
        ],
        default: "MANUAL",
      },

      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },

    // ========================================
    // CUSTOMER
    // ========================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    // ========================================
    // COMPANY
    // ========================================

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // ========================================
    // CREATED BY
    // ========================================

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


// ==========================================
// INDEXES
// ==========================================

cashLedgerSchema.index({
  company: 1,
  transactionDate: -1,
});

cashLedgerSchema.index({
  company: 1,
  type: 1,
});

cashLedgerSchema.index({
  company: 1,
  referenceNumber: 1,
});


const CashLedger = mongoose.model(
  "CashLedger",
  cashLedgerSchema
);

export default CashLedger;