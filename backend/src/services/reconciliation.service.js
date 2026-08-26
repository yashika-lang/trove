import ApiError from "../exceptions/ApiError.js";
import mongoose from "mongoose";
import { notificationService } from "./notification.service.js";

import {
  getReconciliationTransactions,
  countReconciliationTransactions,
  getReconciliationStats,
  getPaymentById,
  getBankTransactionById,
  updateReconciliation,
  findPaymentMatches,
  findAutoReconciliationMatches,
  findReconciledPaymentTransaction,
} from "../repositories/reconciliation.repository.js";


// ==========================================
// GET RECONCILIATION TRANSACTIONS
// ==========================================

const getReconciliationTransactionsService = async (
  user,
  filters = {}
) => {

  // ----------------------------------------
  // VALIDATE COMPANY
  // ----------------------------------------

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ----------------------------------------
  // BUILD QUERY
  // ----------------------------------------

  const query = {
    reconciliationStatus:
      filters.reconciliationStatus ||
      "UNRECONCILED",
  };


  // ----------------------------------------
  // BANK FILTER
  // ----------------------------------------

  if (filters.bankAccount) {

    if (
      !mongoose.Types.ObjectId.isValid(
        filters.bankAccount
      )
    ) {
      throw new ApiError(
        400,
        "Invalid bank account ID."
      );
    }

    query.bankAccount =
      filters.bankAccount;
  }


  // ----------------------------------------
  // TYPE FILTER
  // ----------------------------------------

  if (filters.type) {

    if (
      !["CREDIT", "DEBIT"].includes(
        filters.type
      )
    ) {
      throw new ApiError(
        400,
        "Invalid transaction type."
      );
    }

    query.type =
      filters.type;
  }


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  if (filters.search) {

    const search =
      String(filters.search).trim();

    query.$or = [
      {
        transactionNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        referenceNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        narration: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }


  // ----------------------------------------
  // DATE FILTER
  // ----------------------------------------

  if (
    filters.startDate ||
    filters.endDate
  ) {

    query.transactionDate = {};

    if (filters.startDate) {

      const startDate =
        new Date(filters.startDate);

      if (
        Number.isNaN(
          startDate.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid start date."
        );
      }

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      query.transactionDate.$gte =
        startDate;
    }


    if (filters.endDate) {

      const endDate =
        new Date(filters.endDate);

      if (
        Number.isNaN(
          endDate.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid end date."
        );
      }

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      query.transactionDate.$lte =
        endDate;
    }


    // --------------------------------------
    // INVALID DATE RANGE
    // --------------------------------------

    if (
      query.transactionDate.$gte &&
      query.transactionDate.$lte &&
      query.transactionDate.$gte >
        query.transactionDate.$lte
    ) {
      throw new ApiError(
        400,
        "Start date cannot be after end date."
      );
    }
  }


  // ----------------------------------------
  // PAGINATION
  // ----------------------------------------

  const page =
    Math.max(
      Number(filters.page) || 1,
      1
    );

  const limit =
    Math.min(
      Math.max(
        Number(filters.limit) || 10,
        1
      ),
      100
    );

  const skip =
    (page - 1) * limit;


  // ----------------------------------------
  // FETCH DATA
  // ----------------------------------------

  const [
    transactions,
    total,
  ] = await Promise.all([
    getReconciliationTransactions(
      user.company,
      query,
      skip,
      limit
    ),

    countReconciliationTransactions(
      user.company,
      query
    ),
  ]);


  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return {
    transactions,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(
          total / limit
        ),
    },
  };
};


// ==========================================
// RECONCILIATION STATS
// ==========================================

const getReconciliationStatsService = async (
  user
) => {

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }

  return await getReconciliationStats(
    user.company
  );
};


// ==========================================
// FIND PAYMENT MATCHES
// ==========================================

const findPaymentMatchesService = async (
  transactionId,
  user
) => {

  // ----------------------------------------
  // TRANSACTION ID VALIDATION
  // ----------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      transactionId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid bank transaction ID."
    );
  }


  // ----------------------------------------
  // GET TRANSACTION
  // ----------------------------------------

  const transaction =
    await getBankTransactionById(
      transactionId,
      user.company
    );

  if (!transaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }


  // ----------------------------------------
  // ALREADY RECONCILED
  // ----------------------------------------

  if (
    transaction.reconciliationStatus ===
    "RECONCILED"
  ) {
    throw new ApiError(
      400,
      "Transaction is already reconciled."
    );
  }


  // ----------------------------------------
  // ONLY CREDIT TRANSACTIONS
  // ----------------------------------------

  if (
    transaction.type !== "CREDIT"
  ) {
    return {
      transaction,

      matches: [],

      message:
        "No customer payment matches are available for debit transactions.",
    };
  }


  // ----------------------------------------
  // FIND MATCHES
  // ----------------------------------------

  const matches =
    await findPaymentMatches(
      user.company,
      transaction
    );


  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return {
    transaction,

    matches,
  };
};


// ==========================================
// AUTO RECONCILE TRANSACTION
// ==========================================

const autoReconcileTransactionService = async (
  transactionId,
  user
) => {

  // ----------------------------------------
  // TRANSACTION ID VALIDATION
  // ----------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      transactionId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid bank transaction ID."
    );
  }


  // ----------------------------------------
  // GET TRANSACTION
  // ----------------------------------------

  const transaction =
    await getBankTransactionById(
      transactionId,
      user.company
    );

  if (!transaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }


  // ----------------------------------------
  // ALREADY RECONCILED
  // ----------------------------------------

  if (
    transaction.reconciliationStatus ===
    "RECONCILED"
  ) {
    throw new ApiError(
      400,
      "Transaction is already reconciled."
    );
  }


  // ----------------------------------------
  // ONLY CREDIT
  // ----------------------------------------

  if (
    transaction.type !== "CREDIT"
  ) {
    throw new ApiError(
      400,
      "Only credit transactions can be auto-reconciled."
    );
  }


  // ----------------------------------------
  // FIND POSSIBLE MATCHES
  // ----------------------------------------

  const matches =
    await findAutoReconciliationMatches(
      user.company,
      transaction
    );


  // ----------------------------------------
  // NO MATCH
  // ----------------------------------------

  if (
    matches.length === 0
  ) {

    return {
      transaction,

      matched: false,

      matches: [],

      message:
        "No unique payment match found.",
    };
  }


  // ----------------------------------------
  // MULTIPLE MATCHES
  // ----------------------------------------

  if (
    matches.length > 1
  ) {

    return {
      transaction,

      matched: false,

      matches,

      message:
        "Multiple payment matches found. Manual reconciliation is required.",
    };
  }


  // ----------------------------------------
  // EXACTLY ONE MATCH
  // ----------------------------------------

  const payment =
    matches[0];


  // ----------------------------------------
  // FINAL PAYMENT VALIDATION
  // ----------------------------------------

  if (
    payment.status !== "PAID"
  ) {
    throw new ApiError(
      400,
      "Matched payment is not marked as PAID."
    );
  }


  if (
    Number(transaction.amount) !==
    Number(payment.amount)
  ) {
    throw new ApiError(
      400,
      "Payment amount does not match bank transaction amount."
    );
  }
  // ----------------------------------------
// CHECK PAYMENT ALREADY RECONCILED
// ----------------------------------------

const existingMatch =
  await findReconciledPaymentTransaction(
    payment._id,
    user.company,
    transaction._id
  );

if (existingMatch) {
  throw new ApiError(
    409,
    "This payment is already reconciled with another bank transaction."
  );
}


  // ----------------------------------------
  // RECONCILE
  // ----------------------------------------

  const updatedTransaction =
    await updateReconciliation(
      transactionId,
      user.company,
      {
        payment:
          payment._id,

        reconciliationStatus:
          "RECONCILED",
      }
    );


  if (!updatedTransaction) {
    throw new ApiError(
      404,
      "Bank transaction could not be reconciled."
    );
  }


  // ----------------------------------------
  // NOTIFY
  // ----------------------------------------

  await notificationService.notify({
    companyId: user.company,
    type: "TRANSACTION_RECONCILED",
    title: "Bank transaction reconciled",
    message: `Transaction ${updatedTransaction.transactionNumber} auto-matched to payment ${payment.paymentNumber}.`,
    relatedId: updatedTransaction._id,
  });


  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return {
    transaction:
      updatedTransaction,

    matched: true,

    payment,

    message:
      "Transaction automatically reconciled successfully.",
  };
};


// ==========================================
// MANUAL RECONCILE TRANSACTION
// ==========================================

const reconcileTransactionService = async (
  transactionId,
  paymentId,
  user
) => {

  // ----------------------------------------
  // TRANSACTION ID VALIDATION
  // ----------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      transactionId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid bank transaction ID."
    );
  }


  // ----------------------------------------
  // PAYMENT ID REQUIRED
  // ----------------------------------------

  if (!paymentId) {
    throw new ApiError(
      400,
      "Payment ID is required for reconciliation."
    );
  }


  // ----------------------------------------
  // PAYMENT ID VALIDATION
  // ----------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      paymentId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid payment ID."
    );
  }


  // ----------------------------------------
  // GET BANK TRANSACTION
  // ----------------------------------------

  const transaction =
    await getBankTransactionById(
      transactionId,
      user.company
    );

  if (!transaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }


  // ----------------------------------------
  // ALREADY RECONCILED
  // ----------------------------------------

  if (
    transaction.reconciliationStatus ===
    "RECONCILED"
  ) {
    throw new ApiError(
      400,
      "Transaction is already reconciled."
    );
  }


  // ----------------------------------------
  // ONLY CREDIT TRANSACTIONS
  // ----------------------------------------

  if (
    transaction.type !== "CREDIT"
  ) {
    throw new ApiError(
      400,
      "Only credit transactions can be reconciled with customer payments."
    );
  }


  // ----------------------------------------
  // GET PAYMENT
  // ----------------------------------------

  const payment =
    await getPaymentById(
      paymentId,
      user.company
    );

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found."
    );
  }


  // ----------------------------------------
  // PAYMENT MUST BE PAID
  // ----------------------------------------

  if (
    payment.status !== "PAID"
  ) {
    throw new ApiError(
      400,
      "Only paid payments can be reconciled."
    );
  }


  // ----------------------------------------
  // AMOUNT MATCH
  // ----------------------------------------

  if (
    Number(transaction.amount) !==
    Number(payment.amount)
  ) {
    throw new ApiError(
      400,
      "Payment amount does not match bank transaction amount."
    );
  }


  // ----------------------------------------
  // CHECK PAYMENT ALREADY RECONCILED
  // ----------------------------------------

  const existingMatch =
    await getBankTransactionById(
      transactionId,
      user.company
    );


  /*
   * The repository already gives us the
   * current transaction.
   *
   * To prevent a payment from being linked
   * twice, the repository should ideally
   * expose a dedicated lookup.
   *
   * For now, findPaymentMatches excludes
   * already-linked payments, so use it as
   * the final availability check.
   */

  const availableMatches =
    await findPaymentMatches(
      user.company,
      transaction
    );


  const paymentStillAvailable =
    availableMatches.some(
      (item) =>
        String(item._id) ===
        String(payment._id)
    );


  if (!paymentStillAvailable) {
    throw new ApiError(
      409,
      "This payment is already reconciled with another bank transaction."
    );
  }


  // ----------------------------------------
  // RECONCILE
  // ----------------------------------------

  const updatedTransaction =
    await updateReconciliation(
      transactionId,
      user.company,
      {
        payment:
          payment._id,

        reconciliationStatus:
          "RECONCILED",
      }
    );


  if (!updatedTransaction) {
    throw new ApiError(
      404,
      "Bank transaction could not be updated."
    );
  }


  // ----------------------------------------
  // NOTIFY
  // ----------------------------------------

  await notificationService.notify({
    companyId: user.company,
    type: "TRANSACTION_RECONCILED",
    title: "Bank transaction reconciled",
    message: `Transaction ${updatedTransaction.transactionNumber} manually matched to payment ${payment.paymentNumber}.`,
    relatedId: updatedTransaction._id,
  });


  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return {
    transaction:
      updatedTransaction,

    matched: true,

    payment,

    message:
      "Transaction reconciled successfully.",
  };
};


// ==========================================
// EXPORTS
// ==========================================

export {
  getReconciliationTransactionsService,
  getReconciliationStatsService,
  findPaymentMatchesService,
  autoReconcileTransactionService,
  reconcileTransactionService,
};