import express from "express";

import {
  createBankTransaction,
  getAllBankTransactions,
  getBankTransactionById,
  updateBankTransaction,
  deleteBankTransaction,
  reconcileBankTransaction,
  getBankTransactionStats,
  exportBankTransactions,
} from "../controllers/bankTransaction.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.js";

import {
  createBankTransactionSchema,
  updateBankTransactionSchema,
  reconcileBankTransactionSchema,
} from "../validators/bankTransaction.validation.js";

const router = express.Router();


// ==========================================
// VIEW BANK TRANSACTIONS
// Admin + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getAllBankTransactions
);


// ==========================================
// TRANSACTION STATS
// Admin + Accountant
// ==========================================

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getBankTransactionStats
);


// ==========================================
// EXPORT TRANSACTIONS (CSV)
// Admin + Accountant
// ==========================================

router.get(
  "/export",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  exportBankTransactions
);


// ==========================================
// VIEW SINGLE TRANSACTION
// Admin + Accountant
// ==========================================

router.get(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getBankTransactionById
);


// ==========================================
// CREATE TRANSACTION
// Admin + Accountant
// ==========================================

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  validate(createBankTransactionSchema),
  createBankTransaction
);


// ==========================================
// UPDATE TRANSACTION
// Admin + Accountant
// ==========================================

router.patch(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  validate(updateBankTransactionSchema),
  updateBankTransaction
);


// ==========================================
// RECONCILE TRANSACTION
// Admin + Accountant
// ==========================================

router.patch(
  "/:transactionId/reconcile",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  validate(reconcileBankTransactionSchema),
  reconcileBankTransaction
);


// ==========================================
// DELETE TRANSACTION
// Admin Only
// ==========================================

router.delete(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin"),
  deleteBankTransaction
);


export default router;