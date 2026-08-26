import ApiError from "../exceptions/ApiError.js";
import Bank from "../models/bank.model.js";

import {
  createBankTransaction as createBankTransactionRepository,
  getAllBankTransactions as getAllBankTransactionsRepository,
  countBankTransactions as countBankTransactionsRepository,
  getBankTransactionById as getBankTransactionByIdRepository,
  updateBankTransaction as updateBankTransactionRepository,
  deleteBankTransaction as deleteBankTransactionRepository,
  getBankTransactionStats as getBankTransactionStatsRepository,
} from "../repositories/bankTransaction.repository.js";


// ==========================================
// GENERATE TRANSACTION NUMBER
// ==========================================

const generateTransactionNumber = async (companyId) => {
  const count = await countBankTransactionsRepository(
    companyId,
    {}
  );

  return `BT-${String(count + 1).padStart(4, "0")}`;
};


const createBankTransaction = async (
  transactionData,
  user
) => {
  const bank = await Bank.findOne({
    _id: transactionData.bankAccount,
    company: user.company,
    status: "ACTIVE",
  });

  if (!bank) {
    throw new ApiError(
      404,
      "Active bank account not found."
    );
  }

  const transactionNumber =
    await generateTransactionNumber(user.company);

  // Compute and validate the resulting balance before creating the
  // transaction, so a DEBIT that would go negative never creates an orphan
  // row that then has to be deleted — and so balanceAfterTransaction can be
  // stored on the transaction itself (see model comment) rather than
  // recomputed later by walking back from the bank's live balance.
  const newBalance =
    transactionData.type === "CREDIT"
      ? bank.currentBalance + transactionData.amount
      : bank.currentBalance - transactionData.amount;

  if (newBalance < 0) {
    throw new ApiError(
      400,
      "Insufficient bank balance."
    );
  }

  const transaction =
    await createBankTransactionRepository({
      ...transactionData,
      transactionNumber,
      balanceAfterTransaction: newBalance,
      company: user.company,
      createdBy: user._id,
    });

  bank.currentBalance = newBalance;
  await bank.save();

  return transaction;
};


// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

const getAllBankTransactions = async (
  user,
  filters = {}
) => {
  const query = {};

  if (filters.bankAccount) {
    query.bankAccount = filters.bankAccount;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.reconciliationStatus) {
    query.reconciliationStatus =
      filters.reconciliationStatus;
  }

  if (filters.search) {
    query.$or = [
      {
        transactionNumber: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        referenceNumber: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        narration: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [transactions, total] =
    await Promise.all([
      getAllBankTransactionsRepository(
        user.company,
        query,
        skip,
        limit
      ),
      countBankTransactionsRepository(
        user.company,
        query
      ),
    ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// ==========================================
// GET TRANSACTION BY ID
// ==========================================

const getBankTransactionById = async (
  transactionId,
  user
) => {
  const transaction =
    await getBankTransactionByIdRepository(
      transactionId,
      user.company
    );

  if (!transaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }

  return transaction;
};


// ==========================================
// UPDATE TRANSACTION
// ==========================================

const updateBankTransaction = async (
  transactionId,
  updateData,
  user
) => {
  const existingTransaction =
    await getBankTransactionByIdRepository(
      transactionId,
      user.company
    );

  if (!existingTransaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }

  if (
    existingTransaction.reconciliationStatus ===
    "RECONCILED"
  ) {
    throw new ApiError(
      400,
      "Reconciled transactions cannot be modified."
    );
  }

  // Keep financial balance consistent.
  if (
    updateData.amount !== undefined ||
    updateData.type !== undefined ||
    updateData.bankAccount !== undefined
  ) {
    throw new ApiError(
      400,
      "Financial transaction fields cannot be modified directly. Create a reversal transaction instead."
    );
  }

  const updatedTransaction =
    await updateBankTransactionRepository(
      transactionId,
      user.company,
      updateData
    );

  return updatedTransaction;
};


// ==========================================
// DELETE TRANSACTION
// ==========================================

const deleteBankTransaction = async (
  transactionId,
  user
) => {
  const transaction =
    await getBankTransactionByIdRepository(
      transactionId,
      user.company
    );

  if (!transaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }

  if (
    transaction.reconciliationStatus ===
    "RECONCILED"
  ) {
    throw new ApiError(
      400,
      "Reconciled transactions cannot be deleted."
    );
  }

  const bank = await Bank.findOne({
    _id: transaction.bankAccount,
    company: user.company,
  });

  if (bank) {
    const reversedBalance =
      transaction.type === "CREDIT"
        ? bank.currentBalance - transaction.amount
        : bank.currentBalance + transaction.amount;

    if (reversedBalance < 0) {
      throw new ApiError(
        400,
        "Cannot delete this transaction — it would take the bank balance negative."
      );
    }

    bank.currentBalance = reversedBalance;
    await bank.save();
  }

  await deleteBankTransactionRepository(
    transactionId,
    user.company
  );

  return transaction;
};


// ==========================================
// RECONCILE TRANSACTION
// ==========================================

const reconcileBankTransaction = async (
  transactionId,
  reconciliationStatus,
  user
) => {
  const transaction =
    await getBankTransactionByIdRepository(
      transactionId,
      user.company
    );

  if (!transaction) {
    throw new ApiError(
      404,
      "Bank transaction not found."
    );
  }

  const updatedTransaction =
    await updateBankTransactionRepository(
      transactionId,
      user.company,
      {
        reconciliationStatus,
      }
    );

  return updatedTransaction;
};


// ==========================================
// TRANSACTION STATS
// ==========================================

const getBankTransactionStats = async (user) => {
  return await getBankTransactionStatsRepository(
    user.company
  );
};


export {
  createBankTransaction,
  getAllBankTransactions,
  getBankTransactionById,
  updateBankTransaction,
  deleteBankTransaction,
  reconcileBankTransaction,
  getBankTransactionStats,
};