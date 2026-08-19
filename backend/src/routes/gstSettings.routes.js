import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getGSTSettingsController,
  saveGSTSettingsController,
  deleteGSTSettingsController,
} from "../controllers/gstSettings.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getGSTSettingsController
);

router.put(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  saveGSTSettingsController
);

router.delete(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  deleteGSTSettingsController
);

export default router;