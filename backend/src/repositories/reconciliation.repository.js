import BankTransaction from "../models/bankTransaction.model.js";
import Payment from "../models/payment.model.js";


// ==========================================
// GET RECONCILIATION TRANSACTIONS
// ==========================================

const getReconciliationTransactions = async (
  companyId,
  query = {},
  skip = 0,
  limit = 10
) => {
  return await BankTransaction.find({
    company: companyId,
    ...query,
  })
    .populate(
      "bankAccount",
      "bankName accountNumber accountHolderName"
    )
    .populate(
      "payment",
      "paymentNumber customer amount paymentDate paymentMode status"
    )
    .sort({
      transactionDate: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit)
    .lean();
};


// ==========================================
// COUNT RECONCILIATION TRANSACTIONS
// ==========================================

const countReconciliationTransactions = async (
  companyId,
  query = {}
) => {
  return await BankTransaction.countDocuments({
    company: companyId,
    ...query,
  });
};


// ==========================================
// RECONCILIATION STATS
// ==========================================

const getReconciliationStats = async (
  companyId
) => {

  const result =
    await BankTransaction.aggregate([
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

          totalCredit: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$type",
                    "CREDIT",
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          totalDebit: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$type",
                    "DEBIT",
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          reconciledCredit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$type",
                        "CREDIT",
                      ],
                    },
                    {
                      $eq: [
                        "$reconciliationStatus",
                        "RECONCILED",
                      ],
                    },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          unreconciledCredit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$type",
                        "CREDIT",
                      ],
                    },
                    {
                      $eq: [
                        "$reconciliationStatus",
                        "UNRECONCILED",
                      ],
                    },
                  ],
                },
                "$amount",
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
      reconciled: 0,
      unreconciled: 0,
      totalCredit: 0,
      totalDebit: 0,
      reconciledCredit: 0,
      unreconciledCredit: 0,
    }
  );
};


// ==========================================
// GET PAYMENT BY ID
// ==========================================

const getPaymentById = async (
  paymentId,
  companyId
) => {

  return await Payment.findOne({
    _id: paymentId,
    company: companyId,
  })
    .populate(
      "customer",
      "customerName phone email"
    )
    .populate(
      "invoice",
      "invoiceNumber total amountPaid balanceDue status"
    )
    .lean();
};


// ==========================================
// GET BANK TRANSACTION BY ID
// ==========================================

const getBankTransactionById = async (
  transactionId,
  companyId
) => {

  return await BankTransaction.findOne({
    _id: transactionId,
    company: companyId,
  })
    .populate(
      "bankAccount",
      "bankName accountNumber accountHolderName currentBalance"
    )
    .populate(
      "payment",
      "paymentNumber customer amount paymentDate paymentMode status"
    );
};


// ==========================================
// UPDATE RECONCILIATION
// ==========================================

const updateReconciliation = async (
  transactionId,
  companyId,
  updateData
) => {

  return await BankTransaction.findOneAndUpdate(
    {
      _id: transactionId,
      company: companyId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate(
      "bankAccount",
      "bankName accountNumber accountHolderName currentBalance"
    )
    .populate(
      "payment",
      "paymentNumber customer amount paymentDate paymentMode status"
    );
};


// ==========================================
// FIND PAYMENT MATCHES
// ==========================================

const findPaymentMatches = async (
  companyId,
  transaction
) => {

  // ----------------------------------------
  // FIND PAYMENTS ALREADY RECONCILED
  // ----------------------------------------

  const linkedTransactions =
    await BankTransaction.find({
      company: companyId,

      payment: {
        $ne: null,
      },

      reconciliationStatus:
        "RECONCILED",
    })
      .select("payment")
      .lean();


  const linkedPaymentIds =
    linkedTransactions
      .map(
        (item) =>
          item.payment?.toString()
      )
      .filter(Boolean);


  // ----------------------------------------
  // BUILD PAYMENT QUERY
  // ----------------------------------------

  const query = {
    company: companyId,

    amount: transaction.amount,

    status: "PAID",
  };


  // ----------------------------------------
  // EXCLUDE ALREADY RECONCILED PAYMENTS
  // ----------------------------------------

  if (
    linkedPaymentIds.length
  ) {

    query._id = {
      $nin: linkedPaymentIds,
    };
  }


  // ----------------------------------------
  // FETCH MATCHES
  // ----------------------------------------

  return await Payment.find(query)
    .populate(
      "customer",
      "customerName phone email"
    )
    .populate(
      "invoice",
      "invoiceNumber total amountPaid balanceDue status"
    )
    .sort({
      paymentDate: -1,
      createdAt: -1,
    })
    .lean();
};


// ==========================================
// FIND AUTO RECONCILIATION MATCHES
// ==========================================

const findAutoReconciliationMatches = async (
  companyId,
  transaction
) => {

  // ----------------------------------------
  // TRANSACTION DATE
  // ----------------------------------------

  const transactionDate =
    new Date(
      transaction.transactionDate
    );


  // ----------------------------------------
  // DATE WINDOW: ±7 DAYS
  // ----------------------------------------

  const startDate =
    new Date(transactionDate);

  startDate.setDate(
    startDate.getDate() - 7
  );


  const endDate =
    new Date(transactionDate);

  endDate.setDate(
    endDate.getDate() + 7
  );


  // ----------------------------------------
  // FIND ALREADY LINKED PAYMENTS
  // ----------------------------------------

  const linkedTransactions =
    await BankTransaction.find({
      company: companyId,

      payment: {
        $ne: null,
      },

      reconciliationStatus:
        "RECONCILED",
    })
      .select("payment")
      .lean();


  const linkedPaymentIds =
    linkedTransactions
      .map(
        (item) =>
          item.payment?.toString()
      )
      .filter(Boolean);


  // ----------------------------------------
  // BUILD QUERY
  // ----------------------------------------

  const query = {
    company: companyId,

    amount: transaction.amount,

    status: "PAID",

    paymentDate: {
      $gte: startDate,
      $lte: endDate,
    },
  };


  // ----------------------------------------
  // EXCLUDE ALREADY RECONCILED PAYMENTS
  // ----------------------------------------

  if (
    linkedPaymentIds.length
  ) {

    query._id = {
      $nin: linkedPaymentIds,
    };
  }


  // ----------------------------------------
  // RETURN POSSIBLE MATCHES
  // ----------------------------------------

  return await Payment.find(query)
    .populate(
      "customer",
      "customerName phone email"
    )
    .populate(
      "invoice",
      "invoiceNumber total amountPaid balanceDue status"
    )
    .sort({
      paymentDate: -1,
      createdAt: -1,
    })
    .lean();
};


// ==========================================
// CHECK PAYMENT ALREADY RECONCILED
// ==========================================

const findReconciledPaymentTransaction = async (
  paymentId,
  companyId,
  excludeTransactionId = null
) => {

  const query = {
    company: companyId,

    payment: paymentId,

    reconciliationStatus:
      "RECONCILED",
  };


  if (excludeTransactionId) {

    query._id = {
      $ne: excludeTransactionId,
    };
  }


  return await BankTransaction.findOne(
    query
  )
    .select(
      "_id transactionNumber amount transactionDate"
    )
    .lean();
};


export {
  getReconciliationTransactions,
  countReconciliationTransactions,
  getReconciliationStats,
  getPaymentById,
  getBankTransactionById,
  updateReconciliation,
  findPaymentMatches,
  findAutoReconciliationMatches,
  findReconciledPaymentTransaction,
};