import { Router } from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getSettings,
  updateGeneral,
  updateCompany,
  updateInvoice,
  updateGst,
  updatePayment,
  updateNotification,
  updateSecurity,
  getBanks,
  createBank,
  updateBank,
  deleteBank,
  setDefaultBank,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate,
} from "../controllers/settings.controller.js";

const router = Router();

router.use(
  verifyJWT,
  authorizeRoles("Admin")
);

router.get("/", getSettings);

router.patch("/general", updateGeneral);
router.patch("/company-info", updateCompany);
router.patch("/invoice-quotation", updateInvoice);
router.patch("/gst-tax", updateGst);
router.patch("/payment-preferences", updatePayment);
router.patch("/notifications", updateNotification);
router.patch("/security", updateSecurity);

router.get("/bank-accounts", getBanks);
router.post("/bank-accounts", createBank);
router.patch("/bank-accounts/:bankId", updateBank);
router.delete("/bank-accounts/:bankId", deleteBank);
router.patch("/bank-accounts/:bankId/default", setDefaultBank);

router.get("/document-templates", getTemplates);
router.post("/document-templates", createTemplate);
router.patch("/document-templates/:templateId", updateTemplate);
router.delete("/document-templates/:templateId", deleteTemplate);
router.patch("/document-templates/:templateId/default", setDefaultTemplate);

export default router;
