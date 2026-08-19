import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC COMPANY INFORMATION
    // ==========================================

    companyName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    website: {
      type: String,
      trim: true,
      default: null,
    },

    logo: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: null,
    },

    city: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    zipCode: {
      type: String,
      trim: true,
      default: null,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },


    // ==========================================
    // LEGAL & TAX INFORMATION
    // ==========================================

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    businessType: {
      type: String,
      enum: [
        "sole-proprietorship",
        "partnership",
        "llp",
        "private-ltd",
        "public-ltd",
        "other",
      ],
      default: "private-ltd",
    },


    // ==========================================
    // ACCOUNTING INFORMATION
    // ==========================================

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    financialYearStart: {
      type: String,
      default: "april",
      lowercase: true,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);


const Company = mongoose.model(
  "Company",
  companySchema
);

export default Company;