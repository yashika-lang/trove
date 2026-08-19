import { Router } from "express";
import { createCustomer, getAllCustomers, getCustomerById,updateCustomer,getCustomerStats} from "../controllers/customer.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createCustomerSchema } from "../validators/customer.validation.js";

const router = Router();

router.use(
  verifyJWT,
  authorizeRoles("Admin", "Sales")
);

router.post(
  "/",
  validate(createCustomerSchema),
  createCustomer
);

router.get(
  "/",
  getAllCustomers
);

router.get(
  "/stats",
  getCustomerStats
);

router.get(
  "/:customerId",
  getCustomerById
);

router.patch(
  "/:customerId",
  updateCustomer
);

export default router;