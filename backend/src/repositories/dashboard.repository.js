import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import Product from "../models/product.model.js";
import Quotation from "../models/quotation.model.js";
import Bank from "../models/bank.model.js";
import BankTransaction from "../models/bankTransaction.model.js";
import GSTTransaction from "../models/gstTransaction.model.js";

// ==========================================
// DASHBOARD SUMMARY
// ==========================================

const getDashboardSummary = async (companyId) => {
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  const [
    todaySalesResult,
    monthlyRevenueResult,
    outstandingResult,
    gstCollectedResult,
    bankBalanceResult,
    pendingInvoicesResult,
  ] = await Promise.all([
    // Today's Sales
    Invoice.aggregate([
      {
        $match: {
          company: companyId,
          invoiceDate: {
            $gte: startOfToday,
            $lt: new Date(
              startOfToday.getTime() +
                24 * 60 * 60 * 1000
            ),
          },
          status: {
            $nin: ["CANCELLED", "DRAFT"],
          },
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: "$total",
          },
        },
      },
    ]),

    // Monthly Revenue
    Invoice.aggregate([
      {
        $match: {
          company: companyId,
          invoiceDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
          status: {
            $nin: ["CANCELLED", "DRAFT"],
          },
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: "$total",
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
            $nin: ["CANCELLED", "PAID"],
          },
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: {
              $ifNull: [
                "$balanceDue",
                0,
              ],
            },
          },
        },
      },
    ]),

    // GST Collected
    GSTTransaction.aggregate([
      {
        $match: {
          company: companyId,
          type: "OUTWARD",
          date: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
          status: {
            $ne: "CANCELLED",
          },
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: {
              $ifNull: [
                "$totalTax",
                0,
              ],
            },
          },
        },
      },
    ]),

    // Total Bank Balance
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
          value: {
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

    // Pending Invoices
    Invoice.countDocuments({
      company: companyId,
      status: {
        $nin: [
          "PAID",
          "CANCELLED",
          "DRAFT",
        ],
      },
    }),
  ]);

  return {
    todaySales:
      todaySalesResult[0]?.value || 0,

    monthlyRevenue:
      monthlyRevenueResult[0]?.value || 0,

    outstanding:
      outstandingResult[0]?.value || 0,

    gstCollected:
      gstCollectedResult[0]?.value || 0,

    totalBankBalance:
      bankBalanceResult[0]?.value || 0,

    pendingInvoices:
      pendingInvoicesResult || 0,
  };
};

// ==========================================
// REVENUE TREND
// LAST 6 MONTHS
// ==========================================

const getRevenueTrend = async (companyId) => {
  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1
  );

  const result = await Invoice.aggregate([
    {
      $match: {
        company: companyId,
        invoiceDate: {
          $gte: startDate,
        },
        status: {
          $nin: [
            "CANCELLED",
            "DRAFT",
          ],
        },
      },
    },

    {
      $group: {
        _id: {
          year: {
            $year: "$invoiceDate",
          },
          month: {
            $month: "$invoiceDate",
          },
        },

        revenue: {
          $sum: "$total",
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trend = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const year =
      date.getFullYear();

    const month =
      date.getMonth() + 1;

    const found = result.find(
      (item) =>
        item._id.year === year &&
        item._id.month === month
    );

    trend.push({
      month:
        monthNames[month - 1],

      year,

      revenue:
        found?.revenue || 0,
    });
  }

  return trend;
};

// ==========================================
// PAYMENT DISTRIBUTION
// ==========================================

const getPaymentDistribution = async (
  companyId
) => {
  const result =
    await Payment.aggregate([
      {
        $match: {
          company: companyId,
        },
      },

      {
        $group: {
          _id: "$mode",

          amount: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]);

  return result.map(
    (item) => ({
      mode:
        item._id || "UNKNOWN",

      amount:
        item.amount || 0,

      count:
        item.count || 0,
    })
  );
};

// ==========================================
// TOP PRODUCTS
// ==========================================

const getTopProducts = async (
  companyId,
  limit = 5
) => {
  const result =
    await Invoice.aggregate([
      {
        $match: {
          company: companyId,
          status: {
            $nin: [
              "CANCELLED",
              "DRAFT",
            ],
          },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.product",

          revenue: {
            $sum: {
              $ifNull: [
                "$items.amount",
                0,
              ],
            },
          },

          quantity: {
            $sum: {
              $ifNull: [
                "$items.quantity",
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },

      {
        $limit: Number(limit),
      },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,

          productId: "$_id",

          productName: {
            $ifNull: [
              "$product.productName",
              "Unknown Product",
            ],
          },

          revenue: 1,

          quantity: 1,
        },
      },
    ]);

  return result;
};

// ==========================================
// RECENT ACTIVITY
// ==========================================

const getRecentActivity = async (
  companyId,
  limit = 10
) => {
  const [
    invoices,
    payments,
    quotations,
    bankTransactions,
  ] = await Promise.all([
    Invoice.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate(
        "customer",
        "customerName"
      )
      .lean(),

    Payment.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate(
        "invoice",
        "invoiceNumber"
      )
      .lean(),

    Quotation.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate(
        "customer",
        "customerName"
      )
      .lean(),

    BankTransaction.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate(
        "bankAccount",
        "bankName"
      )
      .lean(),
  ]);

  const activities = [];

  // Invoices
  for (const invoice of invoices) {
    activities.push({
      type: "INVOICE",

      title:
        invoice.status === "CANCELLED"
          ? `Invoice ${invoice.invoiceNumber} cancelled`
          : `Invoice ${invoice.invoiceNumber} generated`,

      description:
        invoice.customer?.customerName ||
        "Customer",

      amount:
        invoice.total || 0,

      date:
        invoice.createdAt,
    });
  }

  // Payments
  for (const payment of payments) {
    activities.push({
      type: "PAYMENT",

      title: "Payment received",

      description:
        payment.mode ||
        "Payment",

      reference:
        payment.utr || "",

      amount:
        payment.amount || 0,

      date:
        payment.createdAt ||
        payment.paymentDate,
    });
  }

  // Quotations
  for (const quotation of quotations) {
    activities.push({
      type: "QUOTATION",

      title:
        `Quotation ${quotation.quotationNumber} ${String(
          quotation.status || ""
        ).toLowerCase()}`,

      description:
        quotation.customer?.customerName ||
        "Customer",

      amount:
        quotation.total || 0,

      date:
        quotation.createdAt,
    });
  }

  // Bank transactions
  for (const transaction of bankTransactions) {
    activities.push({
      type: "BANK_TRANSACTION",

      title:
        "Bank transaction added",

      description:
        transaction.bankAccount?.bankName ||
        transaction.narration ||
        "Bank transaction",

      amount:
        transaction.amount || 0,

      transactionType:
        transaction.type,

      date:
        transaction.createdAt ||
        transaction.transactionDate,
    });
  }

  activities.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );

  return activities.slice(
    0,
    Number(limit)
  );
};

export {
  getDashboardSummary,
  getRevenueTrend,
  getPaymentDistribution,
  getTopProducts,
  getRecentActivity,
};