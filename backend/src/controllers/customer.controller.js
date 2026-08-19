import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import CustomerService from "../services/customer.service.js";

const customerService = new CustomerService();

const createCustomer = asyncHandler(async (req, res) => {
const customerData = req.body;

  const customer = await customerService.createCustomer(
    customerData,
    req.user.company,
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      customer,
      "Customer created successfully."
    )
  );
  });

  const getAllCustomers = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const customers = await customerService.getAllCustomers({
    companyId: req.user.company,
    search,
    status,
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      customers,
      "Customers fetched successfully."
    )
  );
});
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(
    req.params.customerId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      customer,
      "Customer fetched successfully."
    )
  );
});
const updateCustomer = asyncHandler(async (req, res) => {
  const updatedCustomer = await customerService.updateCustomer(
    req.params.customerId,
    req.user.company,
    req.body
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedCustomer,
      "Customer updated successfully."
    )
  );
});
const getCustomerStats = asyncHandler(async (req, res) => {
  const stats = await customerService.getCustomerStats(
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Customer stats fetched successfully."
    )
  );
});


export {
  createCustomer,
  getAllCustomers,
  getCustomerById,
   updateCustomer,
   getCustomerStats,
};