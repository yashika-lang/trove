import GSTTransaction from "../models/gstTransaction.model.js";
import GSTReconciliation from "../models/gstReconciliation.model.js";

// ==========================================
// GET GST TRANSACTIONS FOR RECONCILIATION
// ==========================================

const getGSTReconciliationTransactions = async (
  companyId,
  filters = {},
  skip = 0,
  limit = 20
) => {
  const query = {
    company: companyId,
  };

  // ----------------------------------------
  // RECONCILIATION STATUS
  // ----------------------------------------

  if (filters.reconciliationStatus) {
    query.reconciliationStatus =
      filters.reconciliationStatus;
  }

  // ----------------------------------------
  // TRANSACTION TYPE
  // ----------------------------------------

  if (filters.type) {
    query.type = filters.type;
  }

  // ----------------------------------------
  // GSTIN
  // ----------------------------------------

  if (filters.gstin) {
    query.gstin = {
      $regex: filters.gstin,
      $options: "i",
    };
  }

  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  if (filters.search) {
    query.$or = [
      {
        documentNumber: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        supplierName: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        gstin: {
          $regex: filters.search,
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
    query.date = {};

    if (filters.startDate) {
      const startDate =
        new Date(filters.startDate);

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      query.date.$gte = startDate;
    }

    if (filters.endDate) {
      const endDate =
        new Date(filters.endDate);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      query.date.$lte = endDate;
    }
  }

  const [
    transactions,
    total,
  ] = await Promise.all([
    GSTTransaction.find(query)
      .populate(
        "supplier",
        "supplierName gstin phone email"
      )
      .sort({
        date: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    GSTTransaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      total,
      skip,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};


// ==========================================
// GET GST TRANSACTION BY ID
// ==========================================

const getGSTReconciliationTransactionById =
  async (
    transactionId,
    companyId
  ) => {
    return await GSTTransaction.findOne({
      _id: transactionId,
      company: companyId,
    }).populate(
      "supplier",
      "supplierName gstin phone email"
    );
  };


// ==========================================
// UPDATE GST RECONCILIATION STATUS
// ==========================================

const updateGSTReconciliationStatus =
  async (
    transactionId,
    companyId,
    updateData
  ) => {
    return await GSTTransaction.findOneAndUpdate(
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
    ).populate(
      "supplier",
      "supplierName gstin phone email"
    );
  };


// ==========================================
// GST RECONCILIATION STATS
// ==========================================

const getGSTReconciliationStats =
  async (companyId) => {
    const result =
      await GSTTransaction.aggregate([
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

            matched: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$reconciliationStatus",
                      "MATCHED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            mismatched: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$reconciliationStatus",
                      "MISMATCH",
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

            missing: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$reconciliationStatus",
                      "MISSING",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            totalTaxableValue: {
              $sum: {
                $ifNull: [
                  "$taxableAmount",
                  0,
                ],
              },
            },

            totalGST: {
              $sum: {
                $ifNull: [
                  "$totalTax",
                  0,
                ],
              },
            },

            totalDifference: {
              $sum: {
                $ifNull: [
                  "$reconciliationDifference",
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
        matched: 0,
        mismatched: 0,
        unreconciled: 0,
        missing: 0,
        totalTaxableValue: 0,
        totalGST: 0,
        totalDifference: 0,
      }
    );
  };


// ==========================================
// CREATE RECONCILIATION RECORD
// ==========================================

const createGSTReconciliation =
  async (data) => {
    return await GSTReconciliation.create(
      data
    );
  };


// ==========================================
// GET RECONCILIATION RECORDS
// ==========================================

const getGSTReconciliations =
  async (
    companyId,
    filters = {}
  ) => {
    const query = {
      company: companyId,
    };

    if (filters.status) {
      query.status =
        filters.status;
    }

    if (filters.period) {
      query.period =
        filters.period;
    }

    if (filters.search) {
      query.$or = [
        {
          documentNumber: {
            $regex:
              filters.search,
            $options: "i",
          },
        },
        {
          supplierName: {
            $regex:
              filters.search,
            $options: "i",
          },
        },
        {
          gstin: {
            $regex:
              filters.search,
            $options: "i",
          },
        },
      ];
    }

    return await GSTReconciliation.find(
      query
    )
      .sort({
        createdAt: -1,
      })
      .populate(
        "createdBy",
        "fullName email"
      );
  };


// ==========================================
// RECONCILIATION RECORD STATS
// ==========================================
//
// Matches the reference UI's summary cards (Matched / Value mismatch /
// Missing in books / Missing in 2B) — counts real GSTReconciliation
// records by their own status field. The GSTTransaction-based stats
// above aggregate a different, disconnected field (reconciliationStatus)
// that doesn't exist on that model at all and is never populated.
// ==========================================

const getReconciliationRecordStats =
  async (companyId, filters = {}) => {

    const query = {
      company: companyId,
    };

    if (filters.period) {
      query.period = filters.period;
    }

    const result =
      await GSTReconciliation.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

    const stats = {
      matched: 0,
      valueMismatch: 0,
      missingInBooks: 0,
      missingIn2B: 0,
    };

    for (const item of result) {
      if (item._id === "MATCHED") stats.matched = item.count;
      if (item._id === "VALUE_MISMATCH") stats.valueMismatch = item.count;
      if (item._id === "MISSING_IN_BOOKS") stats.missingInBooks = item.count;
      if (item._id === "MISSING_IN_2B") stats.missingIn2B = item.count;
    }

    return stats;
  };


// ==========================================
// GET RECONCILIATION BY ID
// ==========================================

const getGSTReconciliationById =
  async (
    reconciliationId,
    companyId
  ) => {
    return await GSTReconciliation.findOne({
      _id: reconciliationId,
      company: companyId,
    }).populate(
      "createdBy",
      "fullName email"
    );
  };


// ==========================================
// UPDATE RECONCILIATION RECORD
// ==========================================

const updateGSTReconciliation =
  async (
    reconciliationId,
    companyId,
    updateData
  ) => {
    return await GSTReconciliation.findOneAndUpdate(
      {
        _id: reconciliationId,
        company: companyId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "createdBy",
      "fullName email"
    );
  };


export {
  getGSTReconciliationTransactions,
  getGSTReconciliationTransactionById,
  updateGSTReconciliationStatus,
  getGSTReconciliationStats,

  createGSTReconciliation,
  getGSTReconciliations,
  getGSTReconciliationById,
  updateGSTReconciliation,
  getReconciliationRecordStats,
};