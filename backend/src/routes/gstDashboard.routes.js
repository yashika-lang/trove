import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getGSTDashboardController,
} from "../controllers/gstDashboard.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTDashboardController
);

export default router;