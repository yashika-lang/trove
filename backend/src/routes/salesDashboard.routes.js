import express from "express";

import {
  getSalesDashboardSummary,
  getSalesMonthlyPerformance,
  getSalesFollowUps,
  getSalesRecentCustomers,
  getSalesActivity,
} from "../controllers/salesDashboard.controller.js";

const router =
  express.Router();


// ==========================================
// SALES DASHBOARD
// ==========================================

router.get(
  "/summary",
  getSalesDashboardSummary
);

router.get(
  "/monthly-performance",
  getSalesMonthlyPerformance
);

router.get(
  "/follow-ups",
  getSalesFollowUps
);

router.get(
  "/recent-customers",
  getSalesRecentCustomers
);

router.get(
  "/activity",
  getSalesActivity
);


export default router;