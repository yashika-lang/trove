import { Router } from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
} from "../controllers/product.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.js";

import {
  createProductSchema,
} from "../validators/product.validation.js";


const router = Router();


// GET ALL PRODUCTS
// Admin + Sales can view products
router.get(
  "/",
  verifyJWT,
  authorizeRoles("Admin", "Sales"),
  getAllProducts
);


// GET PRODUCT STATS
// Admin only
router.get(
  "/stats",
  verifyJWT,
  authorizeRoles("Admin"),
  getProductStats
);


// GET PRODUCT BY ID
// Admin + Sales can view product details
router.get(
  "/:productId",
  verifyJWT,
  authorizeRoles("Admin", "Sales"),
  getProductById
);


// CREATE PRODUCT
// Admin only
router.post(
  "/",
  verifyJWT,
  authorizeRoles("Admin"),
  validate(createProductSchema),
  createProduct
);


// UPDATE PRODUCT
// Admin only
router.patch(
  "/:productId",
  verifyJWT,
  authorizeRoles("Admin"),
  updateProduct
);


// DELETE PRODUCT
// Admin only
router.delete(
  "/:productId",
  verifyJWT,
  authorizeRoles("Admin"),
  deleteProduct
);


export default router;