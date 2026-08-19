import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  getReconciliationTransactionsService,
  getReconciliationStatsService,
  reconcileTransactionService,
  findPaymentMatchesService,
  autoReconcileTransactionService,
  
} from "../services/reconciliation.service.js";


// ==========================================
// GET RECONCILIATION TRANSACTIONS
// ==========================================

const getReconciliationTransactions = asyncHandler(
  async (req, res) => {
    const {
      bankAccount,
      type,
      reconciliationStatus,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result =
      await getReconciliationTransactionsService(
        req.user,
        {
          bankAccount,
          type,
          reconciliationStatus,
          search,
          startDate,
          endDate,
          page,
          limit,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Reconciliation transactions fetched successfully."
      )
    );
  }
);


// ==========================================
// RECONCILIATION STATS
// ==========================================

const getReconciliationStats = asyncHandler(
  async (req, res) => {
    const stats =
      await getReconciliationStatsService(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        stats,
        "Reconciliation statistics fetched successfully."
      )
    );
  }
);


// ==========================================
// FIND PAYMENT MATCHES
// ==========================================

const findPaymentMatches = asyncHandler(
  async (req, res) => {

    const result =
      await findPaymentMatchesService(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Payment matches fetched successfully."
      )
    );
  }
);
// ==========================================
// AUTO RECONCILE TRANSACTION
// Admin + Accountant
// ==========================================

const autoReconcileTransaction = asyncHandler(
  async (req, res) => {

    const result =
      await autoReconcileTransactionService(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Auto reconciliation completed successfully."
      )
    );
  }
);

// ==========================================
// RECONCILE TRANSACTION
// ==========================================

const reconcileTransaction = asyncHandler(
  async (req, res) => {

    const transaction =
      await reconcileTransactionService(
        req.params.transactionId,
        req.body.paymentId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        transaction,
        "Transaction reconciled successfully."
      )
    );
  }
);
export {
  getReconciliationTransactions,
  getReconciliationStats,
  findPaymentMatches,
  autoReconcileTransaction,
  reconcileTransaction,
};