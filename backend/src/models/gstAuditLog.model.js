import mongoose from "mongoose";

const gstAuditLogSchema =
  new mongoose.Schema(
    {
      action: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      entityType: {
        type: String,
        trim: true,
      },

      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },

      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

gstAuditLogSchema.index({
  company: 1,
  createdAt: -1,
});

const GSTAuditLog = mongoose.model(
  "GSTAuditLog",
  gstAuditLogSchema
);

export default GSTAuditLog;