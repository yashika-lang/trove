import User from "../models/user.model.js";
import Invoice from "../models/invoice.model.js";
import Quotation from "../models/quotation.model.js";
import Customer from "../models/customer.model.js";
import Payment from "../models/payment.model.js";
import Bank from "../models/bank.model.js";

// ======================================================
// GET BASIC PROFILE
// ======================================================

const getProfileRepository = async (userId) => {
  return await User.findById(userId)
    .select("-password -refreshToken")
    .populate("company", "companyName")
    .lean();
};

// ======================================================
// SALES PROFILE METRICS
// ======================================================

const getSalesMetricsRepository = async (
  companyId,
  startDate,
  endDate
) => {

  const [
    quotationStats,
    salesStats,
    paymentStats,
  ] = await Promise.all([

    // Today's quotations
    Quotation.aggregate([
      {
        $match: {
          company: companyId,
          quotationDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalQuotations: {
            $sum: 1,
          },
        },
      },
    ]),

    // Today's sales
    Invoice.aggregate([
      {
        $match: {
          company: companyId,

          invoiceDate: {
            $gte: startDate,
            $lte: endDate,
          },

          status: {
            $ne: "CANCELLED",
          },
        },
      },
      {
        $group: {
          _id: null,

          totalSales: {
            $sum: {
              $ifNull: ["$total", 0],
            },
          },
        },
      },
    ]),

    // Pending payments
    Invoice.aggregate([
      {
        $match: {
          company: companyId,

          status: {
            $ne: "CANCELLED",
          },

          balanceDue: {
            $gt: 0,
          },
        },
      },
      {
        $group: {
          _id: null,

          pendingPayments: {
            $sum: {
              $ifNull: ["$balanceDue", 0],
            },
          },
        },
      },
    ]),
  ]);

  return {
    todaysQuotations:
      quotationStats[0]?.totalQuotations || 0,

    todaysSales:
      salesStats[0]?.totalSales || 0,

    pendingPayments:
      paymentStats[0]?.pendingPayments || 0,
  };
};

// ======================================================
// QUOTATION CONVERSION
// ======================================================

const getQuotationConversionRepository = async (
  companyId
) => {

  const result = await Quotation.aggregate([

    {
      $match: {
        company: companyId,
      },
    },

    {
      $group: {
        _id: null,

        total: {
          $sum: 1,
        },

        converted: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$status",
                  "CONVERTED",
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

  const total =
    result[0]?.total || 0;

  const converted =
    result[0]?.converted || 0;

  const conversion =
    total > 0
      ? (converted / total) * 100
      : 0;

  return {
    total,
    converted,
    conversion: Number(
      conversion.toFixed(2)
    ),
  };
};

// ======================================================
// RECENT CUSTOMERS
// ======================================================

const getRecentCustomersRepository = async (
  companyId,
  limit = 5
) => {

  return await Customer.find({
    company: companyId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .select(
      "customerName email phone createdAt"
    )
    .lean();
};

// ======================================================
// ACCOUNTANT METRICS
// ======================================================

const getAccountantMetricsRepository = async (
  companyId
) => {

  const [
    receipts,
    payments,
    outstanding,
    bankBalance,
    gstStats,
  ] = await Promise.all([

    // Total receipts
    Payment.aggregate([
      {
        $match: {
          company: companyId,
        },
      },
      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },
        },
      },
    ]),

    // Total payments
    Invoice.aggregate([
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

          total: {
            $sum: {
              $ifNull: ["$amountPaid", 0],
            },
          },
        },
      },
    ]),

    // Outstanding
    Invoice.aggregate([
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

          total: {
            $sum: {
              $ifNull: ["$balanceDue", 0],
            },
          },
        },
      },
    ]),

    // Bank balance
    Bank.aggregate([
      {
        $match: {
          company: companyId,

          status: "ACTIVE",
        },
      },
      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $ifNull: [
                "$currentBalance",
                0,
              ],
            },
          },
        },
      },
    ]),

    // GST
    Invoice.aggregate([
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

          cgst: {
            $sum: {
              $ifNull: ["$cgst", 0],
            },
          },

          sgst: {
            $sum: {
              $ifNull: ["$sgst", 0],
            },
          },

          igst: {
            $sum: {
              $ifNull: ["$igst", 0],
            },
          },
        },
      },
    ]),
  ]);

  const gst =
    gstStats[0] || {};

  const gstCollected =
    Number(gst.cgst || 0) +
    Number(gst.sgst || 0) +
    Number(gst.igst || 0);

  return {
    totalReceipts:
      receipts[0]?.total || 0,

    totalPayments:
      payments[0]?.total || 0,

    outstandingAmount:
      outstanding[0]?.total || 0,

    gstCollected,

    // Payable cannot be calculated
    // reliably without purchase/input GST data.
    gstPayable: null,

    bankBalance:
      bankBalance[0]?.total || 0,
  };
};

// ======================================================
// ADMIN METRICS
// ======================================================

const getAdminMetricsRepository = async (
  companyId
) => {

  const [
    revenue,
    outstanding,
    gst,
    bank,
  ] = await Promise.all([

    Invoice.aggregate([
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

          total: {
            $sum: {
              $ifNull: ["$total", 0],
            },
          },
        },
      },
    ]),

    Invoice.aggregate([
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

          total: {
            $sum: {
              $ifNull: ["$balanceDue", 0],
            },
          },
        },
      },
    ]),

    Invoice.aggregate([
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

          cgst: {
            $sum: {
              $ifNull: ["$cgst", 0],
            },
          },

          sgst: {
            $sum: {
              $ifNull: ["$sgst", 0],
            },
          },

          igst: {
            $sum: {
              $ifNull: ["$igst", 0],
            },
          },
        },
      },
    ]),

    Bank.aggregate([
      {
        $match: {
          company: companyId,

          status: "ACTIVE",
        },
      },
      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $ifNull: [
                "$currentBalance",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const gstData =
    gst[0] || {};

  const gstCollected =
    Number(gstData.cgst || 0) +
    Number(gstData.sgst || 0) +
    Number(gstData.igst || 0);

  const totalRevenue =
    revenue[0]?.total || 0;

  return {
    totalRevenue,

    // No expense model currently available.
    totalExpenses: null,

    // Profit cannot be calculated accurately
    // without expense/COGS data.
    totalProfit: null,

    outstandingAmount:
      outstanding[0]?.total || 0,

    gstCollected,

    bankBalance:
      bank[0]?.total || 0,
  };
};

// ======================================================
// RECENT ACTIVITY
// ======================================================

const getRecentActivityRepository = async (
  companyId,
  limit = 5
) => {

  const payments =
    await Payment.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .populate(
        "customer",
        "customerName"
      )
      .select(
        "amount paymentMethod paymentDate customer createdAt"
      )
      .lean();

  return payments.map(
    (payment) => ({
      type: "PAYMENT_RECORDED",

      title: "Payment Recorded",

      description:
        `Payment of ₹${Number(
          payment.amount || 0
        ).toLocaleString("en-IN")}`,

      paymentMethod:
        payment.paymentMethod || null,

      customer:
        payment.customer?.customerName ||
        null,

      date:
        payment.paymentDate ||
        payment.createdAt,
    })
  );
};

export {
  getProfileRepository,
  getSalesMetricsRepository,
  getQuotationConversionRepository,
  getRecentCustomersRepository,
  getAccountantMetricsRepository,
  getAdminMetricsRepository,
  getRecentActivityRepository,
};