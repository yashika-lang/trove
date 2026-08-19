import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createGSTTransactionController,
  getGSTTransactionsController,
  getGSTTransactionByIdController,
  updateGSTTransactionController,
  deleteGSTTransactionController,
} from "../controllers/gstTransaction.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTTransactionsController
);

router.get(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTTransactionByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createGSTTransactionController
);

router.patch(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  updateGSTTransactionController
);

router.delete(
  "/:transactionId",
  verifyJWT,
  authorizeRoles("admin"),
  deleteGSTTransactionController
);

export default router;