import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  createBankTransaction as createBankTransactionService,
  getAllBankTransactions as getAllBankTransactionsService,
  getBankTransactionById as getBankTransactionByIdService,
  updateBankTransaction as updateBankTransactionService,
  deleteBankTransaction as deleteBankTransactionService,
  reconcileBankTransaction as reconcileBankTransactionService,
  getBankTransactionStats as getBankTransactionStatsService,
} from "../services/bankTransaction.service.js";


// ==========================================
// CREATE BANK TRANSACTION
// ==========================================

const createBankTransaction = asyncHandler(async (req, res) => {
  const transaction = await createBankTransactionService(
    req.body,
    req.user
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      transaction,
      "Bank transaction created successfully."
    )
  );
});


// ==========================================
// GET ALL BANK TRANSACTIONS
// ==========================================

const getAllBankTransactions = asyncHandler(async (req, res) => {
  const {
    bankAccount,
    type,
    reconciliationStatus,
    search,
    page,
    limit,
  } = req.query;

  const result = await getAllBankTransactionsService(
    req.user,
    {
      bankAccount,
      type,
      reconciliationStatus,
      search,
      page,
      limit,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Bank transactions fetched successfully."
    )
  );
});


// ==========================================
// GET TRANSACTION BY ID
// ==========================================

const getBankTransactionById = asyncHandler(
  async (req, res) => {
    const transaction =
      await getBankTransactionByIdService(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        transaction,
        "Bank transaction fetched successfully."
      )
    );
  }
);


// ==========================================
// UPDATE TRANSACTION
// ==========================================

const updateBankTransaction = asyncHandler(
  async (req, res) => {
    const transaction =
      await updateBankTransactionService(
        req.params.transactionId,
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        transaction,
        "Bank transaction updated successfully."
      )
    );
  }
);


// ==========================================
// DELETE TRANSACTION
// ==========================================

const deleteBankTransaction = asyncHandler(
  async (req, res) => {
    const transaction =
      await deleteBankTransactionService(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        transaction,
        "Bank transaction deleted successfully."
      )
    );
  }
);


// ==========================================
// RECONCILE TRANSACTION
// ==========================================

const reconcileBankTransaction = asyncHandler(
  async (req, res) => {
    const transaction =
      await reconcileBankTransactionService(
        req.params.transactionId,
        req.body.reconciliationStatus,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        transaction,
        "Bank transaction reconciliation updated successfully."
      )
    );
  }
);


// ==========================================
// TRANSACTION STATS
// ==========================================

const getBankTransactionStats = asyncHandler(
  async (req, res) => {
    const stats =
      await getBankTransactionStatsService(req.user);

    return res.status(200).json(
      new ApiResponse(
        200,
        stats,
        "Bank transaction statistics fetched successfully."
      )
    );
  }
);


export {
  createBankTransaction,
  getAllBankTransactions,
  getBankTransactionById,
  updateBankTransaction,
  deleteBankTransaction,
  reconcileBankTransaction,
  getBankTransactionStats,
};