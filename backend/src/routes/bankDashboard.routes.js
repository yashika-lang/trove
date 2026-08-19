import express from "express";

import {
  getBankDashboard,
} from "../controllers/bankDashboard.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// ==========================================
// BANK DASHBOARD
// Admin + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getBankDashboard
);


export default router;