import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createITCController,
  getITCController,
  getITCByIdController,
  claimITCController,
  reverseITCController,
  getITCSummaryController,
} from "../controllers/itc.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getITCController
);

router.get(
  "/summary",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getITCSummaryController
);

router.get(
  "/:entryId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getITCByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createITCController
);

router.patch(
  "/:entryId/claim",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  claimITCController
);

router.patch(
  "/:entryId/reverse",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  reverseITCController
);

export default router;