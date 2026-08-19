import express from "express";
import multer from "multer";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  importBankStatement,
} from "../controllers/bankImport.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "accountant"),
  upload.single("file"),
  importBankStatement
);

export default router;