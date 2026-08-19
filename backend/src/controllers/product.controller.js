import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import ProductService from "../services/product.service.js";

const productService = new ProductService();


// CREATE PRODUCT
const createProduct = asyncHandler(async (req, res) => {

  const productData = req.body;

  const product = await productService.createProduct(
    productData,
    req.user.company,
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      product,
      "Product created successfully."
    )
  );
});


// GET ALL PRODUCTS
const getAllProducts = asyncHandler(async (req, res) => {

  const {
    search,
    category,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const products = await productService.getAllProducts({
    companyId: req.user.company,
    search,
    category,
    status,
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      products,
      "Products fetched successfully."
    )
  );
});


// GET PRODUCT BY ID
const getProductById = asyncHandler(async (req, res) => {

  const product = await productService.getProductById(
    req.params.productId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Product fetched successfully."
    )
  );
});


// UPDATE PRODUCT
const updateProduct = asyncHandler(async (req, res) => {

  const updatedProduct = await productService.updateProduct(
    req.params.productId,
    req.user.company,
    req.body
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedProduct,
      "Product updated successfully."
    )
  );
});


// DELETE PRODUCT
const deleteProduct = asyncHandler(async (req, res) => {

  const deletedProduct = await productService.deleteProduct(
    req.params.productId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      deletedProduct,
      "Product deleted successfully."
    )
  );
});


// PRODUCT STATS
const getProductStats = asyncHandler(async (req, res) => {

  const stats = await productService.getProductStats(
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Product stats fetched successfully."
    )
  );
});


export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
};