import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    // ==========================================
    // BANK INFORMATION
    // ==========================================

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    branchName: {
      type: String,
      trim: true,
      default: null,
    },

    accountType: {
      type: String,
      enum: [
        "CURRENT",
        "SAVINGS",
      ],
      default: "CURRENT",
    },


    // ==========================================
    // BALANCE
    // ==========================================

    openingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentBalance: {
      type: Number,
      default: 0,
    },


    // ==========================================
    // DEFAULT ACCOUNT
    // ==========================================

    isDefault: {
      type: Boolean,
      default: false,
    },


    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
      ],
      default: "ACTIVE",
    },


    // ==========================================
    // COMPANY
    // ==========================================

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },


    // ==========================================
    // CREATED BY
    // ==========================================

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


// Prevents the same bank account (by account number) from being added
// twice under the same company — previously unenforced at the schema
// level, which allowed duplicate HDFC-style entries to accumulate.
bankSchema.index(
  { company: 1, accountNumber: 1 },
  { unique: true }
);


const Bank = mongoose.model(
  "Bank",
  bankSchema
);

export default Bank;