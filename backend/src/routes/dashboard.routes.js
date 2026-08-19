import express from "express";

import {
  getDashboardController,
  getDashboardSummaryController,
  getRevenueTrendController,
  getPaymentDistributionController,
  getTopProductsController,
  getRecentActivityController,
} from "../controllers/dashboard.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();

// ==========================================
// ADMIN + ACCOUNTANT
// ==========================================

router.use(
  verifyJWT,
  authorizeRoles(
    "ADMIN",
    "ACCOUNTANT"
  )
);

// ==========================================
// COMPLETE DASHBOARD
// GET /api/v1/dashboard
// ==========================================

router.get(
  "/",
  getDashboardController
);

// ==========================================
// SUMMARY
// GET /api/v1/dashboard/summary
// ==========================================

router.get(
  "/summary",
  getDashboardSummaryController
);

// ==========================================
// REVENUE TREND
// GET /api/v1/dashboard/revenue-trend
// ==========================================

router.get(
  "/revenue-trend",
  getRevenueTrendController
);

// ==========================================
// PAYMENT DISTRIBUTION
// GET /api/v1/dashboard/payment-distribution
// ==========================================

router.get(
  "/payment-distribution",
  getPaymentDistributionController
);

// ==========================================
// TOP PRODUCTS
// GET /api/v1/dashboard/top-products
// ==========================================

router.get(
  "/top-products",
  getTopProductsController
);

// ==========================================
// RECENT ACTIVITY
// GET /api/v1/dashboard/recent-activity
// ==========================================

router.get(
  "/recent-activity",
  getRecentActivityController
);

export default router;