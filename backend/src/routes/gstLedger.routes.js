import express from "express";


import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getGSTLedgerController,
  createGSTLedgerEntryController,
  getGSTLedgerEntryByIdController,
  deleteGSTLedgerEntryController,
  exportGSTLedgerController,
} from "../controllers/gstLedger.controller.js";


const router = express.Router();
// ==========================================
// EXPORT GST LEDGER
// Admin + Accountant
// ==========================================

router.get(
  "/export",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  exportGSTLedgerController
);


// ==========================================
// GET GST LEDGER
// Admin + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  getGSTLedgerController
);


// ==========================================
// CREATE GST ENTRY
// Admin + Accountant
// ==========================================

router.post(
  "/entries",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  createGSTLedgerEntryController
);


// ==========================================
// GET GST ENTRY BY ID
// Admin + Accountant
// ==========================================

router.get(
  "/entries/:entryId",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant"
  ),
  getGSTLedgerEntryByIdController
);


// ==========================================
// DELETE GST ENTRY
// Admin ONLY
// ==========================================

router.delete(
  "/entries/:entryId",
  verifyJWT,
  authorizeRoles(
    "admin"
  ),
  deleteGSTLedgerEntryController
);


export default router;