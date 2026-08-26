import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Bank from "../models/bank.model.js";
import BankTransaction from "../models/bankTransaction.model.js";
import GSTTransaction from "../models/gstTransaction.model.js";
import Product from "../models/product.model.js";


// ==========================================
// ACCOUNTANT SUMMARY
// ==========================================

const getAccountantDashboardSummary =
  async (companyId) => {

    const startOfMonth =
      new Date();

    startOfMonth.setDate(1);

    startOfMonth.setHours(
      0,
      0,
      0,
      0
    );


    const [
      receipts,
      payments,
      outstanding,
      gstCollected,
      gstPayable,
      bankBalance,
    ] = await Promise.all([

      // RECEIPTS — real money collected from customers this month.
      // Payment has no `type` field (INCOMING/OUTGOING never existed on
      // the schema, so this aggregation previously matched zero documents
      // and always returned ₹0) — status is the correct discriminator,
      // and only PAID/PARTIALLY_PAID are real money in, matching the same
      // convention used by Reports/Ledger/Payments elsewhere.
      Payment.aggregate([
        {
          $match: {
            company: companyId,

            paymentDate: {
              $gte: startOfMonth,
            },

            status: {
              $in: ["PAID", "PARTIALLY_PAID"],
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),


      // PAYMENTS — real money that left the business this month. There is
      // no vendor/supplier-payment module in this app (Supplier Ledger is
      // an explicit "Future" placeholder elsewhere), so the only concrete
      // "money out" source of truth is bank DEBIT transactions. Cash
      // ledger debits are deliberately excluded here to avoid double-
      // counting: a cash withdrawal from a bank is a bank DEBIT and a
      // cash ledger CREDIT for the same rupee, not two separate outflows.
      BankTransaction.aggregate([
        {
          $match: {
            company: companyId,

            transactionDate: {
              $gte: startOfMonth,
            },

            type: "DEBIT",
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),


      // OUTSTANDING
      Invoice.aggregate([
        {
          $match: {
            company: companyId,

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
                    $ifNull: [
                      "$total",
                      0,
                    ],
                  },

                  {
                    $ifNull: [
                      "$amountPaid",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      ]),


      // GST COLLECTED
      GSTTransaction.aggregate([
        {
          $match: {
            company: companyId,

            type: "OUTWARD",

            date: {
              $gte: startOfMonth,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
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


      // GST PAYABLE / INPUT TAX
      GSTTransaction.aggregate([
        {
          $match: {
            company: companyId,

            type: "INWARD",

            date: {
              $gte: startOfMonth,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
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


      // BANK BALANCE
      Bank.aggregate([
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


    return {
      totalReceipts:
        receipts[0]?.total || 0,

      totalPayments:
        payments[0]?.total || 0,

      outstandingAmount:
        outstanding[0]?.total || 0,

      gstCollected:
        gstCollected[0]?.total || 0,

      gstPayable:
        gstPayable[0]?.total || 0,

      bankBalance:
        bankBalance[0]?.total || 0,
    };
  };


// ==========================================
// REVENUE TREND
// ==========================================

const getAccountantRevenueTrend =
  async (companyId) => {

    const startDate =
      new Date();

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


    return await GSTTransaction.aggregate([
      {
        $match: {
          company: companyId,

          type: "OUTWARD",

          date: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },

            month: {
              $month: "$date",
            },
          },

          revenue: {
            $sum: {
              $ifNull: [
                "$taxableAmount",
                0,
              ],
            },
          },

          gstCollected: {
            $sum: {
              $ifNull: [
                "$totalTax",
                0,
              ],
            },
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
  };


// ==========================================
// PAYMENT DISTRIBUTION
// ==========================================

const getPaymentDistribution =
  async (companyId) => {

    return await Payment.aggregate([
      {
        $match: {
          company: companyId,

          // Only real money collected — a FAILED/PENDING/REFUNDED payment
          // must not inflate the mode breakdown, matching the same
          // convention used everywhere else in this app.
          status: {
            $in: ["PAID", "PARTIALLY_PAID"],
          },
        },
      },

      {
        $group: {
          _id: "$paymentMode",

          amount: {
            $sum: {
              $ifNull: [
                "$amount",
                0,
              ],
            },
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
  };


// ==========================================
// TOP PRODUCTS
// ==========================================

const getTopProducts =
  async (companyId) => {

    const result =
      await Invoice.aggregate([
        {
          $match: {
            company: companyId,
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
                $multiply: [
                  {
                    $ifNull: [
                      "$items.quantity",
                      0,
                    ],
                  },

                  {
                    $ifNull: [
                      "$items.rate",
                      0,
                    ],
                  },
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
          $limit: 5,
        },
      ]);


    const productIds =
      result
        .map(
          (item) => item._id
        )
        .filter(Boolean);


    const products =
      await Product.find({
        _id: {
          $in: productIds,
        },

        company: companyId,
      }).lean();


    const productMap =
      new Map(
        products.map(
          (product) => [
            product._id.toString(),
            product,
          ]
        )
      );


    return result.map(
      (item) => {

        const product =
          productMap.get(
            item._id?.toString()
          );


        return {
          productId:
            item._id,

          productName:
            product?.productName ||
            "Unknown Product",

          revenue:
            item.revenue || 0,

          quantity:
            item.quantity || 0,
        };
      }
    );
  };


// ==========================================
// RECENT PAYMENTS
// ==========================================

const getRecentPayments =
  async (companyId) => {

    return await Payment.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();
  };


// ==========================================
// RECENT GST
// ==========================================

const getRecentGSTTransactions =
  async (companyId) => {

    return await GSTTransaction.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();
  };


// ==========================================
// RECENT BANK TRANSACTIONS
// ==========================================

const getRecentBankTransactions =
  async (companyId) => {

    return await BankTransaction.find({
      company: companyId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();
  };


export {
  getAccountantDashboardSummary,
  getAccountantRevenueTrend,
  getPaymentDistribution,
  getTopProducts,
  getRecentPayments,
  getRecentGSTTransactions,
  getRecentBankTransactions,
};