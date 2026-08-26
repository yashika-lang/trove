import express from "express";

import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentStats,
  downloadPaymentReceiptPdf,
  emailPaymentReceipt,
} from "../controllers/payment.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.js";

import {
  createPaymentSchema,
  updatePaymentSchema,
  updatePaymentStatusSchema,
} from "../validators/payment.validation.js";

const router = express.Router();

// ==========================================
// VIEW PAYMENTS
// Admin + Sales + Accountant
// ==========================================

router.get(
  "/",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  getAllPayments
);

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  getPaymentStats
);

router.get(
  "/:paymentId",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  getPaymentById
);

router.get(
  "/:paymentId/pdf",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  downloadPaymentReceiptPdf
);

router.post(
  "/:paymentId/email",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  emailPaymentReceipt
);

// ==========================================
// CREATE PAYMENT
// Admin + Sales + Accountant
// ==========================================

router.post(
  "/",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  validate(createPaymentSchema),
  createPayment
);

// ==========================================
// UPDATE PAYMENT
// Admin + Sales + Accountant
// ==========================================

router.patch(
  "/:paymentId",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  validate(updatePaymentSchema),
  updatePayment
);

// ==========================================
// UPDATE PAYMENT STATUS
// Admin + Sales + Accountant
// ==========================================

router.patch(
  "/:paymentId/status",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);

// ==========================================
// DELETE PAYMENT
// Admin Only
// ==========================================

router.delete(
  "/:paymentId",
  verifyJWT,
  authorizeRoles("Admin"),
  deletePayment
);

export default router;