import { Router } from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getUserProfile,
} from "../controllers/profile.controller.js";

const router = Router();

// ======================================================
// GET MY PROFILE
// ======================================================

router.get(
  "/",

  verifyJWT,

  authorizeRoles(
    "Admin",
    "Sales",
    "Accountant"
  ),

  getUserProfile
);

export default router;