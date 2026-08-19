import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createTaxRateController,
  getTaxRatesController,
  getTaxRateByIdController,
  updateTaxRateController,
  deleteTaxRateController,
} from "../controllers/taxRate.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getTaxRatesController
);

router.get(
  "/:rateId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getTaxRateByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createTaxRateController
);

router.patch(
  "/:rateId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  updateTaxRateController
);

router.delete(
  "/:rateId",
  verifyJWT,
  authorizeRoles("admin"),
  deleteTaxRateController
);

export default router;