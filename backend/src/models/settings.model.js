import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },

    invoiceQuotation: {
      invoicePrefix: { type: String, default: "INV", trim: true },
      quotationPrefix: { type: String, default: "QTN", trim: true },
      creditNotePrefix: { type: String, default: "CN", trim: true },
      debitNotePrefix: { type: String, default: "DN", trim: true },
      autoNumbering: { type: Boolean, default: true },
      nextInvoiceNumber: { type: Number, default: 1, min: 1 },
      nextQuotationNumber: { type: Number, default: 1, min: 1 },
      defaultPaymentTerms: {
        type: String,
        enum: ["DUE_ON_RECEIPT", "NET_7", "NET_15", "NET_30", "NET_45", "NET_60"],
        default: "NET_30",
      },
      dueDays: { type: Number, default: 30, min: 0 },
    },

    gstTax: {
      defaultGstRate: { type: Number, default: 18, min: 0, max: 100 },
      inclusiveTax: { type: Boolean, default: false },
      reverseCharge: { type: Boolean, default: false },
      tds: { type: Boolean, default: false },
      tcs: { type: Boolean, default: false },
      roundOffMethod: {
        type: String,
        enum: ["NORMAL", "UP", "DOWN"],
        default: "NORMAL",
      },
      gstReminders: { type: Boolean, default: true },
      gstReminderDays: { type: Number, default: 5, min: 0 },
    },

    paymentPreferences: {
      methods: {
        cash: { type: Boolean, default: true },
        upi: { type: Boolean, default: true },
        bankTransfer: { type: Boolean, default: true },
        creditCard: { type: Boolean, default: true },
        debitCard: { type: Boolean, default: true },
        digitalWallet: { type: Boolean, default: false },
      },
      defaultPaymentMethod: {
        type: String,
        enum: ["cash", "upi", "bankTransfer", "creditCard", "debitCard", "digitalWallet"],
        default: "bankTransfer",
      },
      defaultPaymentTerms: {
        type: String,
        enum: ["DUE_ON_RECEIPT", "NET_7", "NET_15", "NET_30", "NET_45", "NET_60"],
        default: "NET_30",
      },
    },

    notifications: {
      channels: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
        desktop: { type: Boolean, default: true },
      },

      events: {
        invoiceCreated: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          whatsapp: { type: Boolean, default: false },
          desktop: { type: Boolean, default: true },
        },
        paymentReceived: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          whatsapp: { type: Boolean, default: false },
          desktop: { type: Boolean, default: true },
        },
        quotationSent: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          whatsapp: { type: Boolean, default: false },
          desktop: { type: Boolean, default: true },
        },
        gstReminders: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          whatsapp: { type: Boolean, default: false },
          desktop: { type: Boolean, default: true },
        },
        lowStockAlerts: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          whatsapp: { type: Boolean, default: false },
          desktop: { type: Boolean, default: true },
        },
      },
    },

    securityPolicy: {
      twoFactorAuthentication: { type: Boolean, default: false },
      minimumPasswordLength: { type: Number, default: 8, min: 6, max: 128 },
      requireSpecialCharacters: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      passwordExpirationDays: { type: Number, default: 90, min: 0 },
      sessionTimeoutMinutes: { type: Number, default: 30, min: 5 },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
