import express from "express";

import {
  createInvoice,
  createInvoiceFromQuotation,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceStats,
  downloadInvoicePdf,
  emailInvoice,
} from "../controllers/invoice.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.js";

import {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  createInvoiceFromQuotationSchema,
} from "../validators/invoice.validation.js";

const router = express.Router();

// ==========================================
// VIEW INVOICES
// Admin + Sales + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  getAllInvoices
);

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  getInvoiceStats
);

router.get(
  "/:invoiceId",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  getInvoiceById
);

router.get(
  "/:invoiceId/pdf",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  downloadInvoicePdf
);

router.post(
  "/:invoiceId/email",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  emailInvoice
);

// ==========================================
// CREATE DIRECT INVOICE
// Admin + Sales
// ==========================================

router.post(
  "/",
  verifyJWT,
  authorizeRoles("Admin", "Sales"),
  validate(createInvoiceSchema),
  createInvoice
);

// ==========================================
// CONVERT QUOTATION → INVOICE
// Admin + Sales
// ==========================================

router.post(
  "/from-quotation/:quotationId",
  verifyJWT,
  authorizeRoles("Admin", "Sales"),
  validate(createInvoiceFromQuotationSchema),
  createInvoiceFromQuotation
);

// ==========================================
// UPDATE INVOICE
// Admin + Sales
// ==========================================

router.patch(
  "/:invoiceId",
  verifyJWT,
  authorizeRoles("Admin", "Sales"),
  validate(updateInvoiceSchema),
  updateInvoice
);

// ==========================================
// UPDATE INVOICE STATUS
// Admin + Sales
// ==========================================

router.patch(
  "/:invoiceId/status",
  verifyJWT,
  authorizeRoles("Admin", "Sales"),
  validate(updateInvoiceStatusSchema),
  updateInvoiceStatus
);

// ==========================================
// DELETE INVOICE
// Admin only
// ==========================================

router.delete(
  "/:invoiceId",
  verifyJWT,
  authorizeRoles("Admin"),
  deleteInvoice
);

export default router;