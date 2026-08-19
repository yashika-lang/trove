import express from "express";

import {
  getAccountantDashboardSummary,
  getAccountantRevenueTrend,
  getAccountantPaymentDistribution,
  getAccountantTopProducts,
  getAccountantRecentActivity,
} from "../controllers/accountantDashboard.controller.js";

const router =
  express.Router();


// ==========================================
// ACCOUNTANT DASHBOARD
// ==========================================

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