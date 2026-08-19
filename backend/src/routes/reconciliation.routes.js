import express from "express";

import {
  getReconciliationTransactions,
  getReconciliationStats,
  findPaymentMatches,
  reconcileTransaction,
  autoReconcileTransaction,
} from "../controllers/reconciliation.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// ==========================================
// VIEW RECONCILIATION
// Admin + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getReconciliationTransactions
);


// ==========================================
// RECONCILIATION STATS
// Admin + Accountant
// ==========================================

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getReconciliationStats
);


// ==========================================
// FIND PAYMENT MATCHES
// Admin + Accountant
// ==========================================

router.get(
  "/:transactionId/matches",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  findPaymentMatches
);

router.post(
  "/:transactionId/auto-reconcile",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  autoReconcileTransaction
);


// ==========================================
// RECONCILE TRANSACTION
// Admin + Accountant
// ==========================================

router.patch(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  reconcileTransaction
);


export default router;