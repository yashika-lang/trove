import express from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createHsnSacController,
  getHsnSacController,
  getHsnSacByIdController,
  updateHsnSacController,
  deleteHsnSacController,
} from "../controllers/hsnSac.controller.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getHsnSacController
);

router.get(
  "/:entryId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  getHsnSacByIdController
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  createHsnSacController
);

router.patch(
  "/:entryId",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  updateHsnSacController
);

router.delete(
  "/:entryId",
  verifyJWT,
  authorizeRoles("admin"),
  deleteHsnSacController
);

export default router;