import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import {
  createGSTAuditLog,
  getGSTAuditLogs,
  getGSTAuditLogById,
} from "../repositories/gstAuditLog.repository.js";

class GSTAuditLogService {
  // ==========================================
  // CREATE LOG
  // ==========================================

  async createLog(
    data,
    user
  ) {
    const {
      action,
      description,
      entityType,
      entityId,
      metadata,
    } = data;

    if (!action?.trim()) {
      throw new ApiError(
        400,
        "Audit action is required."
      );
    }

    if (!description?.trim()) {
      throw new ApiError(
        400,
        "Audit description is required."
      );
    }

    if (
      entityId &&
      !mongoose.Types.ObjectId.isValid(
        entityId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid entity ID."
      );
    }

    return await createGSTAuditLog({
      action: action.trim(),

      description:
        description.trim(),

      entityType:
        entityType?.trim() || "",

      entityId:
        entityId || null,

      metadata:
        metadata || {},

      performedBy:
        user._id,

      company:
        user.company,
    });
  }

  // ==========================================
  // GET LOGS
  // ==========================================

  async getLogs(
    user,
    filters = {}
  ) {
    const page =
      Math.max(
        Number(filters.page) || 1,
        1
      );

    const limit =
      Math.min(
        Math.max(
          Number(filters.limit) || 20,
          1
        ),
        100
      );

    return await getGSTAuditLogs(
      user.company,
      filters,
      (page - 1) * limit,
      limit
    );
  }

  // ==========================================
  // GET LOG BY ID
  // ==========================================

  async getLogById(
    logId,
    user
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        logId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid audit log ID."
      );
    }

    const log =
      await getGSTAuditLogById(
        logId,
        user.company
      );

    if (!log) {
      throw new ApiError(
        404,
        "GST audit log not found."
      );
    }

    return log;
  }
}

export default GSTAuditLogService;