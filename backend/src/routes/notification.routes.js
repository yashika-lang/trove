import { Router } from "express";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// All roles can see their company's notifications.
router.use(verifyJWT, authorizeRoles("Admin", "Sales", "Accountant"));

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:notificationId/read", markAsRead);

export default router;
