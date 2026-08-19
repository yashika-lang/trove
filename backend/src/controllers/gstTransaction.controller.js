import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  createGSTTransaction,
  getGSTTransactions,
  getGSTTransactionById,
  updateGSTTransaction,
  deleteGSTTransaction,
} from "../services/gstTransaction.service.js";


// ==========================================
// CREATE GST TRANSACTION
// ==========================================

const createGSTTransactionController =
  asyncHandler(async (req, res) => {

    const result =
      await createGSTTransaction(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "GST transaction created successfully."
      )
    );
  });


// ==========================================
// GET GST TRANSACTIONS
// ==========================================

const getGSTTransactionsController =
  asyncHandler(async (req, res) => {

    const {
      type,
      search,
      gstin,
      startDate,
      endDate,
      reconciliationStatus,
      page,
      limit,
    } = req.query;

    const result =
      await getGSTTransactions(
        req.user,
        {
          type,
          search,
          gstin,
          startDate,
          endDate,
          reconciliationStatus,
          page,
          limit,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST transactions fetched successfully."
      )
    );
  });


// ==========================================
// GET GST TRANSACTION BY ID
// ==========================================

const getGSTTransactionByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await getGSTTransactionById(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST transaction fetched successfully."
      )
    );
  });


// ==========================================
// UPDATE GST TRANSACTION
// ==========================================

const updateGSTTransactionController =
  asyncHandler(async (req, res) => {

    const result =
      await updateGSTTransaction(
        req.params.transactionId,
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST transaction updated successfully."
      )
    );
  });


// ==========================================
// DELETE GST TRANSACTION
// ==========================================

const deleteGSTTransactionController =
  asyncHandler(async (req, res) => {

    const result =
      await deleteGSTTransaction(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST transaction deleted successfully."
      )
    );
  });


export {
  createGSTTransactionController,
  getGSTTransactionsController,
  getGSTTransactionByIdController,
  updateGSTTransactionController,
  deleteGSTTransactionController,
};