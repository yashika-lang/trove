import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getGSTReconciliationTransactionsController,
  getGSTReconciliationStatsController,
  getGSTReconciliationTransactionByIdController,
  markGSTTransactionMatchedController,
  markGSTTransactionMismatchController,
  createGSTReconciliationController,
  getGSTReconciliationsController,
  getGSTReconciliationByIdController,
  updateGSTReconciliationController,
  getGSTReconciliationRecordStatsController,
  rerunGSTReconciliationMatchController,
} from "../controllers/gstReconciliation.controller.js";

const router = express.Router();

router.get(
  "/transactions",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReconciliationTransactionsController
);

router.get(
  "/transactions/stats",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReconciliationStatsController
);

router.get(
  "/transactions/:transactionId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReconciliationTransactionByIdController
);

router.patch(
  "/transactions/:transactionId/match",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  markGSTTransactionMatchedController
);

router.patch(
  "/transactions/:transactionId/mismatch",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  markGSTTransactionMismatchController
);

router.get(
  "/record-stats",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReconciliationRecordStatsController
);

router.post(
  "/rerun-match",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  rerunGSTReconciliationMatchController
);

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReconciliationsController
);

router.get(
  "/:reconciliationId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTReconciliationByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createGSTReconciliationController
);

router.patch(
  "/:reconciliationId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  updateGSTReconciliationController
);

export default router;