import Bank from "../models/bank.model.js";
import BankTransaction from "../models/bankTransaction.model.js";


// ==========================================
// GET BANK DASHBOARD DATA
// ==========================================

const getBankDashboardData = async (
  companyId,
  startOfDay,
  endOfDay,
  filters = {}
) => {

  // ----------------------------------------
  // ACTIVE BANK ACCOUNTS
  // ----------------------------------------

  const banks = await Bank.find({
    company: companyId,
    status: "ACTIVE",
  })
    .select(
      "_id bankName accountNumber currentBalance"
    )
    .lean();


  if (!banks.length) {
    return {
      totalBalance: 0,
      todayCredit: 0,
      todayDebit: 0,
      bankCount: 0,
      unreconciledCount: 0,
      accounts: [],
      recentTransactions: [],
      transactionPagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }


  const bankIds = banks.map(
    (bank) => bank._id
  );


  // ========================================
  // DASHBOARD CREDIT / DEBIT
  // ========================================

  const todayStats =
    await BankTransaction.aggregate([
      {
        $match: {
          company: companyId,
          bankAccount: {
            $in: bankIds,
          },
          transactionDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },

      {
        $group: {
          _id: null,

          todayCredit: {
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

          todayDebit: {
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
        },
      },
    ]);


  const stats =
    todayStats[0] || {
      todayCredit: 0,
      todayDebit: 0,
    };


  // ========================================
  // UNRECONCILED COUNT
  // ALL ACTIVE BANKS
  // ========================================

  const unreconciledCount =
    await BankTransaction.countDocuments({
      company: companyId,
      bankAccount: {
        $in: bankIds,
      },
      reconciliationStatus:
        "UNRECONCILED",
    });


  // ========================================
  // PER-BANK TODAY'S TOTALS
  // ========================================

  const bankStats =
    await BankTransaction.aggregate([
      {
        $match: {
          company: companyId,
          bankAccount: {
            $in: bankIds,
          },
          transactionDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },

      {
        $group: {
          _id: "$bankAccount",

          todayCredit: {
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

          todayDebit: {
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
        },
      },
    ]);


  const bankStatsMap = new Map(
    bankStats.map((item) => [
      String(item._id),
      item,
    ])
  );


  // ========================================
  // TRANSACTION QUERY
  // ========================================

  const transactionQuery = {
    company: companyId,
    bankAccount: {
      $in: bankIds,
    },
  };


  // ----------------------------------------
  // BANK FILTER
  // ----------------------------------------

  if (filters.bankAccount) {
    transactionQuery.bankAccount =
      filters.bankAccount;
  }


  // ----------------------------------------
  // TYPE FILTER
  // ----------------------------------------

  if (filters.type) {
    transactionQuery.type =
      filters.type;
  }


  // ----------------------------------------
  // RECONCILIATION STATUS FILTER
  // ----------------------------------------

  if (filters.reconciliationStatus) {
    transactionQuery.reconciliationStatus =
      filters.reconciliationStatus;
  }


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  if (filters.search) {

    const search =
      filters.search.trim();

    if (search) {

      transactionQuery.$or = [
        {
          narration: {
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
          transactionNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
  }


  // ========================================
  // DATE FILTER FOR TRANSACTIONS
  // ========================================

  if (
    filters.startDate ||
    filters.endDate
  ) {

    transactionQuery.transactionDate =
      {};

    if (filters.startDate) {

      const startDate =
        new Date(
          filters.startDate
        );

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      transactionQuery.transactionDate.$gte =
        startDate;
    }


    if (filters.endDate) {

      const endDate =
        new Date(
          filters.endDate
        );

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      transactionQuery.transactionDate.$lte =
        endDate;
    }
  }


  // ========================================
  // PAGINATION
  // ========================================

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


  // ========================================
  // FETCH TRANSACTIONS + COUNT
  // ========================================

  const [
    recentTransactions,
    transactionTotal,
  ] = await Promise.all([

    BankTransaction.find(
      transactionQuery
    )
      .populate(
        "bankAccount",
        "bankName accountNumber"
      )
      .select(
        "bankAccount transactionDate narration amount type referenceNumber reconciliationStatus createdAt transactionNumber"
      )
      .sort({
        transactionDate: -1,
        createdAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    BankTransaction.countDocuments(
      transactionQuery
    ),
  ]);


  // ========================================
  // RECENT ACTIVITY PER BANK
  // ========================================

  const recentActivityMap =
    new Map();


  for (
    const transaction
    of recentTransactions
  ) {

    if (!transaction.bankAccount) {
      continue;
    }


    const bankId =
      String(
        transaction.bankAccount._id
      );


    if (
      !recentActivityMap.has(
        bankId
      )
    ) {

      recentActivityMap.set(
        bankId,
        transaction
      );
    }
  }


  // ========================================
  // BUILD BANK CARDS
  // ========================================

  const accounts =
    banks.map((bank) => {

      const bankStatsData =
        bankStatsMap.get(
          String(bank._id)
        );


      const recent =
        recentActivityMap.get(
          String(bank._id)
        );


      return {

        _id:
          bank._id,

        bankName:
          bank.bankName,

        accountNumber:
          bank.accountNumber,

        balance:
          bank.currentBalance || 0,

        todayCredit:
          bankStatsData?.todayCredit || 0,

        todayDebit:
          bankStatsData?.todayDebit || 0,

        recentActivity:
          recent
            ? {

                date:
                  recent.transactionDate,

                narration:
                  recent.narration,

                amount:
                  recent.amount,

                type:
                  recent.type,

                referenceNumber:
                  recent.referenceNumber,

                reconciliationStatus:
                  recent.reconciliationStatus,

              }
            : null,
      };
    });


  // ========================================
  // RUNNING BALANCE
  // ========================================

  const bankBalanceMap =
    new Map(
      banks.map((bank) => [
        String(bank._id),
        bank.currentBalance || 0,
      ])
    );


  const transactionEntries = [];


  for (
    const transaction
    of recentTransactions
  ) {

    if (!transaction.bankAccount) {
      continue;
    }


    const bankId =
      String(
        transaction.bankAccount._id
      );


    const currentBalance =
      bankBalanceMap.get(
        bankId
      ) || 0;


    let previousBalance;


    if (
      transaction.type ===
      "CREDIT"
    ) {

      previousBalance =
        currentBalance -
        transaction.amount;

    } else {

      previousBalance =
        currentBalance +
        transaction.amount;
    }


    transactionEntries.push({

      _id:
        transaction._id,

      date:
        transaction.transactionDate,

      bank: {

        _id:
          transaction.bankAccount._id,

        bankName:
          transaction.bankAccount.bankName,

        accountNumber:
          transaction.bankAccount.accountNumber,

      },

      narration:
        transaction.narration || "",

      credit:
        transaction.type === "CREDIT"
          ? transaction.amount
          : 0,

      debit:
        transaction.type === "DEBIT"
          ? transaction.amount
          : 0,

      balance:
        currentBalance,

      reconciliationStatus:
        transaction.reconciliationStatus,

      referenceNumber:
        transaction.referenceNumber ||
        null,
    });


    // Move backwards
    bankBalanceMap.set(
      bankId,
      previousBalance
    );
  }


  // ========================================
  // TOTAL BALANCE
  // ========================================

  const totalBalance =
    banks.reduce(
      (sum, bank) =>
        sum +
        (bank.currentBalance || 0),
      0
    );


  // ========================================
  // FINAL RESPONSE
  // ========================================

  return {

    totalBalance,

    todayCredit:
      stats.todayCredit || 0,

    todayDebit:
      stats.todayDebit || 0,

    bankCount:
      banks.length,

    unreconciledCount,

    accounts,

    recentTransactions:
      transactionEntries,

    transactionPagination: {

      page,

      limit,

      total:
        transactionTotal,

      totalPages:
        Math.ceil(
          transactionTotal /
          limit
        ),
    },
  };
};


export {
  getBankDashboardData,
};