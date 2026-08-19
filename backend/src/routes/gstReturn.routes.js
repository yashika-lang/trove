import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createGSTReturnController,
  getGSTReturnsController,
  getGSTReturnByIdController,
  updateGSTReturnController,
  getGSTReturnStatsController,
} from "../controllers/gstReturn.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReturnsController
);

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReturnStatsController
);

router.get(
  "/:returnId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReturnByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createGSTReturnController
);

router.patch(
  "/:returnId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  updateGSTReturnController
);

export default router;