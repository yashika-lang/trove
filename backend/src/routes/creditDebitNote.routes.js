import { Router } from "express";

import { createNote, getNotes, getNoteById } from "../controllers/creditDebitNote.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createNoteSchema } from "../validators/creditDebitNote.validation.js";

const router = Router();

// View: same roles as invoices. Create: same roles as invoices (Admin + Sales).
router.get("/", verifyJWT, authorizeRoles("Admin", "Sales", "Accountant"), getNotes);
router.get("/:noteId", verifyJWT, authorizeRoles("Admin", "Sales", "Accountant"), getNoteById);
router.post("/", verifyJWT, authorizeRoles("Admin", "Sales"), validate(createNoteSchema), createNote);

export default router;
