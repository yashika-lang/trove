import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import GSTAuditLogService from "../services/gstAuditLog.service.js";

const service =
  new GSTAuditLogService();


// ==========================================
// CREATE AUDIT LOG
// ==========================================

const createGSTAuditLogController =
  asyncHandler(async (req, res) => {

    const result =
      await service.createLog(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "GST audit log created successfully."
      )
    );
  });


// ==========================================
// GET AUDIT LOGS
// ==========================================

const getGSTAuditLogsController =
  asyncHandler(async (req, res) => {

    const {
      action,
      entityType,
      entityId,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result =
      await service.getLogs(
        req.user,
        {
          action,
          entityType,
          entityId,
          search,
          startDate,
          endDate,
          page,
          limit,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST audit logs fetched successfully."
      )
    );
  });


// ==========================================
// GET AUDIT LOG BY ID
// ==========================================

const getGSTAuditLogByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getLogById(
        req.params.logId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST audit log fetched successfully."
      )
    );
  });


export {
  createGSTAuditLogController,
  getGSTAuditLogsController,
  getGSTAuditLogByIdController,
};