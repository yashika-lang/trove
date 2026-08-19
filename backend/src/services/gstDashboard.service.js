import GSTTransaction from "../models/gstTransaction.model.js";
import GSTLedgerEntry from "../models/gstLedgerEntry.model.js";
import Invoice from "../models/invoice.model.js";
import ApiError from "../exceptions/ApiError.js";

// ==========================================
// GST DASHBOARD
// Admin + Accountant
// ==========================================

const getGSTDashboard = async (user) => {
  const companyId = user.company;

  if (!companyId) {
    throw new ApiError(
      400,
      "Company information is missing."
    );
  }

  // ==========================================
  // GST TRANSACTION STATS
  // ==========================================

  const transactionStats =
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

          totalTaxableAmount: {
            $sum: {
              $ifNull: [
                "$taxableAmount",
                0,
              ],
            },
          },

          totalTax: {
            $sum: {
              $ifNull: [
                "$totalTax",
                0,
              ],
            },
          },

          totalCGST: {
            $sum: {
              $ifNull: [
                "$cgst",
                0,
              ],
            },
          },

          totalSGST: {
            $sum: {
              $ifNull: [
                "$sgst",
                0,
              ],
            },
          },

          totalIGST: {
            $sum: {
              $ifNull: [
                "$igst",
                0,
              ],
            },
          },

          totalCess: {
            $sum: {
              $ifNull: [
                "$cess",
                0,
              ],
            },
          },

          outwardTax: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$type",
                    "OUTWARD",
                  ],
                },
                {
                  $ifNull: [
                    "$totalTax",
                    0,
                  ],
                },
                0,
              ],
            },
          },

          inwardTax: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$type",
                    "INWARD",
                  ],
                },
                {
                  $ifNull: [
                    "$totalTax",
                    0,
                  ],
                },
                0,
              ],
            },
          },

          outwardTaxableAmount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$type",
                    "OUTWARD",
                  ],
                },
                {
                  $ifNull: [
                    "$taxableAmount",
                    0,
                  ],
                },
                0,
              ],
            },
          },

          inwardTaxableAmount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$type",
                    "INWARD",
                  ],
                },
                {
                  $ifNull: [
                    "$taxableAmount",
                    0,
                  ],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

  // ==========================================
  // DOCUMENT STATUS STATS
  // ==========================================

  const statusStats =
    await GSTTransaction.aggregate([
      {
        $match: {
          company: companyId,
        },
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

  const status = {
    draft: 0,
    generated: 0,
    pending: 0,
    filed: 0,
    cancelled: 0,
  };

  for (const item of statusStats) {
    switch (item._id) {
      case "DRAFT":
        status.draft = item.count;
        break;

      case "GENERATED":
        status.generated = item.count;
        break;

      case "PENDING":
        status.pending = item.count;
        break;

      case "FILED":
        status.filed = item.count;
        break;

      case "CANCELLED":
        status.cancelled = item.count;
        break;
    }
  }

  // ==========================================
  // INVOICE GST STATS
  // ==========================================

  const invoiceStats =
    await Invoice.aggregate([
      {
        $match: {
          company: companyId,

          status: {
            $ne: "CANCELLED",
          },
        },
      },

      {
        $group: {
          _id: null,

          invoiceCount: {
            $sum: 1,
          },

          taxableValue: {
            $sum: {
              $ifNull: [
                "$subtotal",
                0,
              ],
            },
          },

          cgst: {
            $sum: {
              $ifNull: [
                "$cgst",
                0,
              ],
            },
          },

          sgst: {
            $sum: {
              $ifNull: [
                "$sgst",
                0,
              ],
            },
          },

          igst: {
            $sum: {
              $ifNull: [
                "$igst",
                0,
              ],
            },
          },
        },
      },
    ]);

  // ==========================================
  // GST LEDGER STATS
  // ==========================================

  const ledgerStats =
    await GSTLedgerEntry.aggregate([
      {
        $match: {
          company: companyId,
        },
      },

      {
        $group: {
          _id: null,

          totalDebit: {
            $sum: {
              $ifNull: [
                "$debit",
                0,
              ],
            },
          },

          totalCredit: {
            $sum: {
              $ifNull: [
                "$credit",
                0,
              ],
            },
          },
        },
      },
    ]);

  // ==========================================
  // DEFAULT VALUES
  // ==========================================

  const transactions =
    transactionStats[0] || {
      totalTransactions: 0,
      totalTaxableAmount: 0,
      totalTax: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalCess: 0,
      outwardTax: 0,
      inwardTax: 0,
      outwardTaxableAmount: 0,
      inwardTaxableAmount: 0,
    };

  const invoices =
    invoiceStats[0] || {
      invoiceCount: 0,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    };

  const ledger =
    ledgerStats[0] || {
      totalDebit: 0,
      totalCredit: 0,
    };

  // ==========================================
  // NET GST LIABILITY
  // ==========================================

  const netGSTLiability =
    transactions.outwardTax -
    transactions.inwardTax;

  // ==========================================
  // RETURN DASHBOARD
  // ==========================================

  return {
    summary: {
      totalTransactions:
        transactions.totalTransactions,

      totalTaxableAmount:
        transactions.totalTaxableAmount,

      totalGST:
        transactions.totalTax,

      totalCGST:
        transactions.totalCGST,

      totalSGST:
        transactions.totalSGST,

      totalIGST:
        transactions.totalIGST,

      totalCess:
        transactions.totalCess,
    },

    outward: {
      taxableAmount:
        transactions.outwardTaxableAmount,

      tax:
        transactions.outwardTax,
    },

    inward: {
      taxableAmount:
        transactions.inwardTaxableAmount,

      tax:
        transactions.inwardTax,
    },

    liability: {
      outputGST:
        transactions.outwardTax,

      inputGST:
        transactions.inwardTax,

      netGST:
        netGSTLiability,
    },

    invoices: {
      count:
        invoices.invoiceCount,

      taxableValue:
        invoices.taxableValue,

      cgst:
        invoices.cgst,

      sgst:
        invoices.sgst,

      igst:
        invoices.igst,
    },

    status,

    ledger: {
      debit:
        ledger.totalDebit,

      credit:
        ledger.totalCredit,

      balance:
        ledger.totalCredit -
        ledger.totalDebit,
    },
  };
};

export {
  getGSTDashboard,
};