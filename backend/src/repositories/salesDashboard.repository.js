import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import Quotation from "../models/quotation.model.js";
import Customer from "../models/customer.model.js";

// ==========================================
// SALES DASHBOARD SUMMARY
// ==========================================

const getSalesDashboardSummary = async (
  companyId,
  userId
) => {
  const [
    revenueResult,
    quotationsCreated,
    quotationsConverted,
    invoicesCreated,
    pendingResult,
  ] = await Promise.all([

    Invoice.aggregate([
      {
        $match: {
          company: companyId,
          createdBy: userId,
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

    Quotation.countDocuments({
      company: companyId,
      createdBy: userId,
    }),

    Quotation.countDocuments({
      company: companyId,
      createdBy: userId,
      status: "CONVERTED",
    }),

    Invoice.countDocuments({
      company: companyId,
      createdBy: userId,
    }),

    Invoice.aggregate([
      {
        $match: {
          company: companyId,
          createdBy: userId,

          status: {
            $in: [
              "SENT",
              "PARTIALLY_PAID",
              "OVERDUE",
            ],
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $subtract: [
                {
                  $ifNull: ["$total", 0],
                },
                {
                  $ifNull: [
                    "$paidAmount",
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    ]),
  ]);

  return {
    personalSalesRevenue:
      revenueResult[0]?.total || 0,

    quotationsCreated,

    quotationsConverted,

    invoicesCreated,

    pendingCustomerPayments:
      pendingResult[0]?.total || 0,
  };
};


// ==========================================
// MONTHLY SALES PERFORMANCE
// ==========================================

const getMonthlySalesPerformance = async (
  companyId,
  userId
) => {
  const startDate = new Date();

  startDate.setMonth(
    startDate.getMonth() - 5
  );

  startDate.setDate(1);

  startDate.setHours(
    0,
    0,
    0,
    0
  );

  const result =
    await Invoice.aggregate([
      {
        $match: {
          company: companyId,
          createdBy: userId,

          createdAt: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },

          revenue: {
            $sum: {
              $ifNull: ["$total", 0],
            },
          },

          invoiceCount: {
            $sum: 1,
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

  return result.map((item) => ({
    year: item._id.year,

    month: item._id.month,

    revenue:
      item.revenue || 0,

    invoiceCount:
      item.invoiceCount || 0,
  }));
};


// ==========================================
// FOLLOW UPS
// ==========================================

const getSalesFollowUps = async (
  companyId,
  userId
) => {
  return await Invoice.find({
    company: companyId,
    createdBy: userId,

    status: {
      $in: [
        "SENT",
        "PARTIALLY_PAID",
        "OVERDUE",
      ],
    },
  })
    .populate(
      "customer",
      "name"
    )
    .sort({
      dueDate: 1,
    })
    .limit(10)
    .lean();
};


// ==========================================
// RECENT CUSTOMERS
// ==========================================

const getSalesRecentCustomers = async (
  companyId,
  userId
) => {
  return await Customer.find({
    company: companyId,
    createdBy: userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
};


// ==========================================
// RECENT INVOICES
// ==========================================

const getSalesRecentInvoices = async (
  companyId,
  userId
) => {
  return await Invoice.find({
    company: companyId,
    createdBy: userId,
  })
    .populate(
      "customer",
      "name"
    )
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
};


// ==========================================
// RECENT QUOTATIONS
// ==========================================

const getSalesRecentQuotations = async (
  companyId,
  userId
) => {
  return await Quotation.find({
    company: companyId,
    createdBy: userId,
  })
    .populate(
      "customer",
      "name"
    )
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
};


// ==========================================
// RECENT PAYMENTS
// ==========================================

const getSalesRecentPayments = async (
  companyId,
  userId
) => {
  return await Payment.find({
    company: companyId,
    createdBy: userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
};


export {
  getSalesDashboardSummary,
  getMonthlySalesPerformance,
  getSalesFollowUps,
  getSalesRecentCustomers,
  getSalesRecentInvoices,
  getSalesRecentQuotations,
  getSalesRecentPayments,
};