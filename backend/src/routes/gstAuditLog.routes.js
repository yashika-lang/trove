import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createGSTAuditLogController,
  getGSTAuditLogsController,
  getGSTAuditLogByIdController,
} from "../controllers/gstAuditLog.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTAuditLogsController
);

router.get(
  "/:logId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTAuditLogByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createGSTAuditLogController
);

export default router;