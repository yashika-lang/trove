import express from "express";
 

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createCashLedgerEntry,
  getCashLedgerEntries,
  getCashLedgerEntry,
  updateCashLedgerEntry,
  deleteCashLedgerEntry,
  getCashLedgerStatsController,
  exportCashLedgerController,
} from "../controllers/cashLedger.controller.js";


const router = express.Router();

router.get(
  "/export",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  exportCashLedgerController
);

// ==========================================
// VIEW CASH LEDGER
// Admin + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  getCashLedgerEntries
);


// ==========================================
// CASH LEDGER STATS
// Admin + Accountant
// ==========================================

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  getCashLedgerStatsController
);


// ==========================================
// GET ENTRY BY ID
// Admin + Accountant
// ==========================================

router.get(
  "/:entryId",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  getCashLedgerEntry
);


// ==========================================
// CREATE CASH ENTRY
// Admin + Accountant
// ==========================================

router.post(
  "/",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  createCashLedgerEntry
);


// ==========================================
// UPDATE CASH ENTRY
// Admin + Accountant
// ==========================================

router.patch(
  "/:entryId",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  updateCashLedgerEntry
);


// ==========================================
// DELETE CASH ENTRY
// Admin ONLY
// ==========================================

router.delete(
  "/:entryId",
  verifyJWT,
  authorizeRoles(
    "admin"
  ),
  deleteCashLedgerEntry
);


export default router;