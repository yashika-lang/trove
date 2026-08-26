import express from "express";

import {
  getSalesDashboardSummary,
  getSalesMonthlyPerformance,
  getSalesFollowUps,
  getSalesRecentCustomers,
  getSalesActivity,
} from "../controllers/salesDashboard.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();


// ==========================================
// SALES DASHBOARD
// ==========================================

router.use(
  verifyJWT,
  authorizeRoles(
    "ADMIN",
    "SALES"
  )
);

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