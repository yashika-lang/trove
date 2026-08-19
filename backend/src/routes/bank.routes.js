import express from "express";

import {
  createBank,
  getAllBanks,
  getBankById,
  updateBank,
  deleteBank,
  getBankStats,
} from "../controllers/bank.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.js";

import {
  createBankSchema,
  updateBankSchema,
} from "../validators/bank.validation.js";

const router = express.Router();


// ==========================================
// VIEW BANK ACCOUNTS
// Admin + Accountant
// ==========================================
router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getAllBanks
);

router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getBankStats
);

router.get(
  "/:bankId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getBankById
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  validate(createBankSchema),
  createBank
);

router.patch(
  "/:bankId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  validate(updateBankSchema),
  updateBank
);

router.delete(
  "/:bankId",
  verifyJWT,
  authorizeRoles("admin"),
  deleteBank
);




export default router;