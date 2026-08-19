import { Router } from "express";

import {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
  getQuotationStats,
} from "../controllers/quotation.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.js";
import { createQuotationSchema } from "../validators/quotation.validation.js";

const router = Router();


// Admin + Sales can access Quotations
router.use(
  verifyJWT,
  authorizeRoles("Admin", "Sales")
);


// Create Quotation
router.post(
  "/",
  validate(createQuotationSchema),
  createQuotation
);


// Get Quotation Stats
router.get(
  "/stats",
  getQuotationStats
);


// Get All Quotations
router.get(
  "/",
  getAllQuotations
);


// Get Quotation By ID
router.get(
  "/:quotationId",
  getQuotationById
);


// Update Quotation
router.patch(
  "/:quotationId",
  updateQuotation
);


// Update Quotation Status
router.patch(
  "/:quotationId/status",
  updateQuotationStatus
);


// Delete Quotation
router.delete(
  "/:quotationId",
  deleteQuotation
);


export default router;