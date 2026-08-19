import express from "express";

import {
  getCustomerLedgerController,
  getCompanyLedgerController,
   exportCustomerLedgerController,
} from "../controllers/ledger.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// ==========================================
// COMPANY LEDGER
// Admin + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getCompanyLedgerController
);

// ==========================================
// EXPORT CUSTOMER LEDGER
// Admin + Accountant + Sales
// ==========================================

router.get(
  "/customer/:customerId/export",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant",
    "sales"
  ),
  exportCustomerLedgerController
);


// ==========================================
// CUSTOMER LEDGER
// Admin + Accountant + Sales
// ==========================================

router.get(
  "/customer/:customerId",
  verifyJWT,
  authorizeRoles(
    "admin",
    "accountant",
    "sales"
  ),
  getCustomerLedgerController
);


export default router;