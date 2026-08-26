import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  verifyJWT,
  authorizeRoles("Admin", "Sales", "Accountant"),
  globalSearch
);

export default router;
