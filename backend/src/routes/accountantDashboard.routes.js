import express from "express";

import {
  getAccountantDashboardSummary,
  getAccountantRevenueTrend,
  getAccountantPaymentDistribution,
  getAccountantTopProducts,
  getAccountantRecentActivity,
} from "../controllers/accountantDashboard.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();


// ==========================================
// ACCOUNTANT DASHBOARD
// ==========================================

router.use(
  verifyJWT,
  authorizeRoles(
    "ADMIN",
    "ACCOUNTANT"
  )
);

router.get(
  "/summary",
  getAccountantDashboardSummary
);

router.get(
  "/revenue-trend",
  getAccountantRevenueTrend
);

router.get(
  "/payment-distribution",
  getAccountantPaymentDistribution
);

router.get(
  "/top-products",
  getAccountantTopProducts
);

router.get(
  "/recent-activity",
  getAccountantRecentActivity
);


export default router;