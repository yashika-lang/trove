import BankTransaction from "../models/bankTransaction.model.js";

const createBankTransaction = async (transactionData) => {
  return await BankTransaction.create(transactionData);
};

const getAllBankTransactions = async (
  companyId,
  query = {},
  skip = 0,
  limit = 10
) => {
  return await BankTransaction.find({
    company: companyId,
    ...query,
  })
    .populate("bankAccount")
    .populate("payment")
    .sort({ transactionDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const countBankTransactions = async (
  companyId,
  query = {}
) => {
  return await BankTransaction.countDocuments({
    company: companyId,
    ...query,
  });
};

const getBankTransactionById = async (
  transactionId,
  companyId
) => {
  return await BankTransaction.findOne({
    _id: transactionId,
    company: companyId,
  })
    .populate("bankAccount")
    .populate("payment");
};

const updateBankTransaction = async (
  transactionId,
  companyId,
  updateData
) => {
  return await BankTransaction.findOneAndUpdate(
    {
      _id: transactionId,
      company: companyId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("bankAccount")
    .populate("payment");
};

const deleteBankTransaction = async (
  transactionId,
  companyId
) => {
  return await BankTransaction.findOneAndDelete({
    _id: transactionId,
    company: companyId,
  });
};

const getBankTransactionStats = async (companyId) => {
  const result = await BankTransaction.aggregate([
    {
      $match: {
        company: companyId,
      },
    },
    {
      $group: {
        _id: null,

        totalTransactions: {
          $sum: 1,
        },

        totalCredit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "CREDIT"] },
              "$amount",
              0,
            ],
          },
        },

        totalDebit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "DEBIT"] },
              "$amount",
              0,
            ],
          },
        },

        unreconciled: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$reconciliationStatus",
                  "UNRECONCILED",
                ],
              },
              1,
              0,
            ],
          },
        },

        reconciled: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$reconciliationStatus",
                  "RECONCILED",
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalTransactions: 0,
      totalCredit: 0,
      totalDebit: 0,
      unreconciled: 0,
      reconciled: 0,
    }
  );
};

export {
  createBankTransaction,
  getAllBankTransactions,
  countBankTransactions,
  getBankTransactionById,
  updateBankTransaction,
  deleteBankTransaction,
  getBankTransactionStats,
};