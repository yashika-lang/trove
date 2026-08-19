import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  exportReportController,
} from "../controllers/reportExport.controller.js";


const router =
  express.Router();


// ==========================================
// AUTH + RBAC
// ==========================================

router.use(
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  )
);


// ==========================================
// EXPORT
// ==========================================
//
// /:reportName
//
// Examples:
//
// /daily-sales?format=csv
// /monthly-sales?format=excel
// /gst?format=pdf
//
// ==========================================

router.get(
  "/:reportName",
  exportReportController
);


export default router;