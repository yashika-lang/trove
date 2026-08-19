import express from "express";


import {

  getDailySales,

  getMonthlySales,

  getQuotationReport,

  getGSTReport,

  getOutstandingReport,

  getLedgerReport,

  getBankSummary,

  getPaymentReport,

  getTopCustomers,

  getTopProducts,

  getQuotationConversion,

} from "../controllers/report.controller.js";


import {

  verifyJWT,

  authorizeRoles,

} from "../middleware/auth.middleware.js";


const router =
  express.Router();


// ======================================================
// AUTH + RBAC
// ======================================================

router.use(
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  )
);


// ======================================================
// SALES REPORTS
// ======================================================


// GET /api/v1/reports/daily-sales

router.get(
  "/daily-sales",
  getDailySales
);


// GET /api/v1/reports/monthly-sales

router.get(
  "/monthly-sales",
  getMonthlySales
);


// GET /api/v1/reports/quotations

router.get(
  "/quotations",
  getQuotationReport
);


// ======================================================
// FINANCE REPORTS
// ======================================================


// GET /api/v1/reports/gst

router.get(
  "/gst",
  getGSTReport
);


// GET /api/v1/reports/outstanding

router.get(
  "/outstanding",
  getOutstandingReport
);


// GET /api/v1/reports/ledger

router.get(
  "/ledger",
  getLedgerReport
);


// GET /api/v1/reports/bank-summary

router.get(
  "/bank-summary",
  getBankSummary
);


// GET /api/v1/reports/payments

router.get(
  "/payments",
  getPaymentReport
);


// ======================================================
// INSIGHTS
// ======================================================


// GET /api/v1/reports/top-customers

router.get(
  "/top-customers",
  getTopCustomers
);


// GET /api/v1/reports/top-products

router.get(
  "/top-products",
  getTopProducts
);


// GET /api/v1/reports/quotation-conversion

router.get(
  "/quotation-conversion",
  getQuotationConversion
);


// ======================================================
// EXPORT
// ======================================================

export default router;