import { Router } from "express";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
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


// ======================================================
// UPDATE MY PROFILE
// ======================================================

router.patch(
  "/",

  verifyJWT,

  authorizeRoles(
    "Admin",
    "Sales",
    "Accountant"
  ),

  updateUserProfile
);


// ======================================================
// UPDATE MY PREFERENCES
// ======================================================

router.patch(
  "/preferences",

  verifyJWT,

  authorizeRoles(
    "Admin",
    "Sales",
    "Accountant"
  ),

  updateUserPreferences
);

export default router;