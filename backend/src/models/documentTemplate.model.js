import mongoose from "mongoose";

const documentTemplateSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["invoice", "quotation", "creditNote", "debitNote"],
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    primaryColor: {
      type: String,
      default: "#2563eb",
      trim: true,
    },

    accentColor: {
      type: String,
      default: "#1e40af",
      trim: true,
    },

    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

documentTemplateSchema.index({ company: 1, type: 1 });

const DocumentTemplate =
  mongoose.model("DocumentTemplate", documentTemplateSchema);

export default DocumentTemplate;
