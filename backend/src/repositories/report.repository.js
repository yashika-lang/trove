import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import Quotation from "../models/quotation.model.js";
import Customer from "../models/customer.model.js";
import Bank from "../models/bank.model.js";
import BankTransaction from "../models/bankTransaction.model.js";


// ======================================================
// DATE FILTER HELPER
// ======================================================

const buildDateFilter = (
  startDate,
  endDate
) => {

  if (!startDate && !endDate) {
    return null;
  }

  const dateFilter = {};


  if (startDate) {

    const start =
      new Date(startDate);

    if (
      Number.isNaN(
        start.getTime()
      )
    ) {
      throw new Error(
        "Invalid start date."
      );
    }

    start.setHours(
      0,
      0,
      0,
      0
    );

    dateFilter.$gte = start;
  }


  if (endDate) {

    const end =
      new Date(endDate);

    if (
      Number.isNaN(
        end.getTime()
      )
    ) {
      throw new Error(
        "Invalid end date."
      );
    }

    end.setHours(
      23,
      59,
      59,
      999
    );

    dateFilter.$lte = end;
  }


  if (
    dateFilter.$gte &&
    dateFilter.$lte &&
    dateFilter.$gte >
      dateFilter.$lte
  ) {
    throw new Error(
      "Start date cannot be after end date."
    );
  }

  return dateFilter;
};


// ======================================================
// DAILY SALES
// ======================================================

const getDailySalesRepository = async (
  companyId,
  filters = {}
) => {

  const query = {
    company: companyId,

    status: {
      $ne: "CANCELLED",
    },
  };


  const dateFilter =
    buildDateFilter(
      filters.startDate,
      filters.endDate
    );


  if (dateFilter) {
    query.invoiceDate =
      dateFilter;
  }


  if (filters.search) {

    query.$or = [

      {
        invoiceNumber: {
          $regex:
            filters.search,
          $options: "i",
        },
      },

    ];
  }


  const result =
    await Invoice.aggregate([

      {
        $match: query,
      },

      {
        $group: {

          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$invoiceDate",
            },
          },

          // "sales"/invoiced total, kept for backward compatibility with
          // any existing consumer of this field.
          sales: {
            $sum: {
              $ifNull: [
                "$total",
                0,
              ],
            },
          },

          taxable: {
            $sum: {
              $ifNull: [
                "$subtotal",
                0,
              ],
            },
          },

          gst: {
            $sum: {
              $add: [
                { $ifNull: ["$cgst", 0] },
                { $ifNull: ["$sgst", 0] },
                { $ifNull: ["$igst", 0] },
              ],
            },
          },

          invoiceCount: {
            $sum: 1,
          },

        },
      },

      {
        $sort: {
          _id: 1,
        },
      },

    ]);


  const totalSales =
    result.reduce(
      (sum, item) =>
        sum +
        Number(item.sales || 0),
      0
    );


  const totalTaxable =
    result.reduce(
      (sum, item) =>
        sum +
        Number(item.taxable || 0),
      0
    );


  const totalGST =
    result.reduce(
      (sum, item) =>
        sum +
        Number(item.gst || 0),
      0
    );


  const totalInvoices =
    result.reduce(
      (sum, item) =>
        sum +
        Number(
          item.invoiceCount || 0
        ),
      0
    );


  return {
    data: result,

    summary: {
      days: result.length,
      totalSales,
      totalTaxable,
      totalGST,
      totalInvoices,
    },
  };
};


// ======================================================
// MONTHLY SALES
// ======================================================

const getMonthlySalesRepository = async (
  companyId,
  filters = {}
) => {

  const query = {
    company: companyId,

    status: {
      $ne: "CANCELLED",
    },
  };


  const dateFilter =
    buildDateFilter(
      filters.startDate,
      filters.endDate
    );


  if (dateFilter) {
    query.invoiceDate =
      dateFilter;
  }


  const result =
    await Invoice.aggregate([

      {
        $match: query,
      },

      {
        $group: {

          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$invoiceDate",
            },
          },

          sales: {
            $sum: {
              $ifNull: [
                "$total",
                0,
              ],
            },
          },

          taxable: {
            $sum: {
              $ifNull: [
                "$subtotal",
                0,
              ],
            },
          },

          gst: {
            $sum: {
              $add: [
                { $ifNull: ["$cgst", 0] },
                { $ifNull: ["$sgst", 0] },
                { $ifNull: ["$igst", 0] },
              ],
            },
          },

          invoiceCount: {
            $sum: 1,
          },

        },
      },

      {
        $sort: {
          _id: 1,
        },
      },

    ]);


  const totalTaxable =
    result.reduce(
      (sum, item) =>
        sum +
        Number(item.taxable || 0),
      0
    );


  const totalGST =
    result.reduce(
      (sum, item) =>
        sum +
        Number(item.gst || 0),
      0
    );


  return {
    data: result,

    summary: {
      totalSales:
        result.reduce(
          (sum, item) =>
            sum +
            Number(
              item.sales || 0
            ),
          0
        ),

      totalTaxable,

      totalGST,

      // Average taxable revenue per month actually present in the report
      // period — matches the "Avg / month" card in the reference UI.
      avgPerMonth:
        result.length
          ? Number(
              (
                totalTaxable /
                result.length
              ).toFixed(2)
            )
          : 0,

      totalInvoices:
        result.reduce(
          (sum, item) =>
            sum +
            Number(
              item.invoiceCount || 0
            ),
          0
        ),
    },
  };
};


// ======================================================
// QUOTATION REPORT
// ======================================================

const getQuotationReportRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const query = {
      company: companyId,
    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {
      query.quotationDate =
        dateFilter;
    }


    if (filters.status) {

      query.status =
        String(
          filters.status
        ).toUpperCase();
    }


    if (filters.search) {

      // Search by quotation number OR matching customer name (per report
      // spec: "Search should support: quotation number, customer, status").
      const matchingCustomers =
        await Customer.find({
          company: companyId,
          customerName: {
            $regex: filters.search,
            $options: "i",
          },
        })
          .select("_id")
          .lean();

      query.$or = [

        {
          quotationNumber: {
            $regex:
              filters.search,
            $options: "i",
          },
        },

        {
          customer: {
            $in: matchingCustomers.map(
              (c) => c._id
            ),
          },
        },

        {
          status: {
            $regex: filters.search,
            $options: "i",
          },
        },

      ];
    }


    const quotations =
      await Quotation.find(query)

        .populate(
          "customer",
          "customerName phone email"
        )

        .select(
          [
            "_id",
            "quotationNumber",
            "customer",
            "quotationDate",
            "validUntil",
            "subtotal",
            "cgst",
            "sgst",
            "igst",
            "total",
            "status",
            "convertedInvoice",
            "createdAt",
          ].join(" ")
        )

        .sort({
          quotationDate: -1,
          createdAt: -1,
        })

        .lean();


    const totalValue =
      quotations.reduce(
        (sum, quotation) =>
          sum +
          Number(
            quotation.total || 0
          ),
        0
      );


    const converted =
      quotations.filter(
        (quotation) =>
          quotation.status ===
          "CONVERTED"
      ).length;


    // "Won / approved" (reference UI card) counts a quotation as won once
    // the customer has accepted it — that includes both APPROVED (accepted,
    // not yet invoiced) and CONVERTED (accepted AND already turned into an
    // invoice) statuses. This is intentionally a different, wider count
    // than `converted` above/`conversionRate` (which specifically tracks
    // the accepted-quotation → invoice conversion funnel elsewhere) — see
    // getQuotationConversionRepository for that narrower definition.
    const wonApproved =
      quotations.filter(
        (quotation) =>
          quotation.status ===
            "APPROVED" ||
          quotation.status ===
            "CONVERTED"
      ).length;


    return {

      quotations,

      summary: {

        total:
          quotations.length,

        converted,

        wonApproved,

        totalValue,

        conversionRate:
          quotations.length
            ? Number(
                (
                  converted /
                  quotations.length
                * 100
                ).toFixed(2)
              )
            : 0,

      },

    };
  };


// ======================================================
// GST REPORT
// ======================================================

// GST Report shows the output tax liability per SALES invoice (Invoice |
// Customer | Date | Taxable | CGST | SGST | Total GST — per the reference
// UI), sourced directly from Invoice's own GST calculation fields — the
// same ones Daily/Monthly Sales and the invoice PDF already use. This is
// deliberately NOT the separate GSTTransaction inward/outward ledger (a
// different subsystem for GST return filing) — that model doesn't match
// the required per-invoice report shape at all.
const getGSTReportRepository = async (
  companyId,
  filters = {}
) => {

  const query = {
    company: companyId,

    status: {
      $ne: "CANCELLED",
    },
  };


  const dateFilter =
    buildDateFilter(
      filters.startDate,
      filters.endDate
    );


  if (dateFilter) {
    query.invoiceDate =
      dateFilter;
  }


  if (filters.search) {

    const matchingCustomers =
      await Customer.find({
        company: companyId,
        customerName: {
          $regex: filters.search,
          $options: "i",
        },
      })
        .select("_id")
        .lean();

    query.$or = [

      {
        invoiceNumber: {
          $regex:
            filters.search,
          $options: "i",
        },
      },

      {
        customer: {
          $in: matchingCustomers.map(
            (c) => c._id
          ),
        },
      },

    ];
  }


  const invoices =
    await Invoice.find(query)

      .populate(
        "customer",
        "customerName"
      )

      .select(
        [
          "_id",
          "invoiceNumber",
          "customer",
          "invoiceDate",
          "subtotal",
          "cgst",
          "sgst",
          "igst",
          "total",
        ].join(" ")
      )

      .sort({
        invoiceDate: -1,
      })

      .lean();


  const rows =
    invoices.map(
      (invoice) => ({

        invoiceNumber:
          invoice.invoiceNumber,

        customer:
          invoice.customer
            ?.customerName ||
          "—",

        date:
          invoice.invoiceDate,

        taxable:
          Number(
            invoice.subtotal || 0
          ),

        cgst:
          Number(
            invoice.cgst || 0
          ),

        sgst:
          Number(
            invoice.sgst || 0
          ),

        igst:
          Number(
            invoice.igst || 0
          ),

        totalGST:
          Number(
            invoice.cgst || 0
          ) +
          Number(
            invoice.sgst || 0
          ) +
          Number(
            invoice.igst || 0
          ),

        total:
          Number(
            invoice.total || 0
          ),

      })
    );


  const taxableValue =
    rows.reduce(
      (sum, row) =>
        sum + row.taxable,
      0
    );


  const totalCGST =
    rows.reduce(
      (sum, row) =>
        sum + row.cgst,
      0
    );


  const totalSGST =
    rows.reduce(
      (sum, row) =>
        sum + row.sgst,
      0
    );


  const totalIGST =
    rows.reduce(
      (sum, row) =>
        sum + row.igst,
      0
    );


  return {

    rows,

    summary: {

      taxableValue,

      // "CGST + SGST" card in the reference UI — intra-state tax collected.
      // IGST (inter-state) is tracked separately, not folded in here, so
      // it isn't misrepresented as CGST/SGST.
      cgstPlusSgst:
        totalCGST + totalSGST,

      totalIGST,

      totalGST:
        totalCGST +
        totalSGST +
        totalIGST,

      invoiceCount:
        rows.length,

    },

  };
};


// ======================================================
// OUTSTANDING REPORT
// ======================================================

// Reads Customer.outstanding directly rather than re-deriving it from
// Invoice — that field is the single authoritative source of truth,
// recalculated on every invoice/payment mutation by
// customerRepository.recalculateOutstanding (which already excludes
// CANCELLED and fully PAID invoices). A second aggregate here would be a
// competing calculation that could silently drift out of sync with it.
const getOutstandingReportRepository =
  async (companyId, filters = {}) => {

    const customerQuery = {

      company: companyId,

      outstanding: {
        $gt: 0,
      },

    };


    if (filters.search) {

      customerQuery.$or = [

        {
          customerName: {
            $regex: filters.search,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: filters.search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: filters.search,
            $options: "i",
          },
        },

      ];
    }


    const customers =
      await Customer.find(
        customerQuery
      )

        .select(
          [
            "_id",
            "customerName",
            "creditLimit",
            "outstanding",
          ].join(" ")
        )

        .sort({
          outstanding: -1,
        })

        .lean();


    const customerIds =
      customers.map(
        (c) => c._id
      );


    const [
      invoiceCounts,
      lastPayments,
    ] = await Promise.all([

      Invoice.aggregate([

        {
          $match: {

            company: companyId,

            customer: {
              $in: customerIds,
            },

            status: {
              $ne: "CANCELLED",
            },

          },
        },

        {
          $group: {

            _id: "$customer",

            invoiceCount: {
              $sum: 1,
            },

          },
        },

      ]),


      Payment.aggregate([

        {
          $match: {

            company: companyId,

            customer: {
              $in: customerIds,
            },

            status: {
              $in: [
                "PAID",
                "PARTIALLY_PAID",
              ],
            },

          },
        },

        {
          $sort: {
            paymentDate: -1,
          },
        },

        {
          $group: {

            _id: "$customer",

            lastPaymentDate: {
              $first: "$paymentDate",
            },

          },
        },

      ]),

    ]);


    const invoiceCountMap =
      new Map(
        invoiceCounts.map(
          (item) => [
            String(item._id),
            item.invoiceCount,
          ]
        )
      );


    const lastPaymentMap =
      new Map(
        lastPayments.map(
          (item) => [
            String(item._id),
            item.lastPaymentDate,
          ]
        )
      );


    const data =
      customers.map(
        (customer) => ({

          _id:
            customer._id,

          customerName:
            customer.customerName,

          creditLimit:
            Number(
              customer.creditLimit || 0
            ),

          outstanding:
            Number(
              customer.outstanding || 0
            ),

          invoiceCount:
            invoiceCountMap.get(
              String(customer._id)
            ) || 0,

          lastPaymentDate:
            lastPaymentMap.get(
              String(customer._id)
            ) || null,

        })
      );


    const totalOutstanding =
      data.reduce(
        (sum, item) =>
          sum + item.outstanding,
        0
      );


    return {
      data,

      summary: {

        totalOutstanding,

        customers:
          data.length,

        avgBalance:
          data.length
            ? Number(
                (
                  totalOutstanding /
                  data.length
                ).toFixed(2)
              )
            : 0,

      },
    };
  };


// ======================================================
// PAYMENT REPORT
// ======================================================

const getPaymentReportRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const query = {
      company: companyId,
    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {
      query.paymentDate =
        dateFilter;
    }


    if (filters.status) {
      query.status =
        String(
          filters.status
        ).toUpperCase();
    }


    // Payment.paymentMode is the real field name (was previously written
    // as the nonexistent `paymentMethod`, which meant this filter always
    // matched zero documents).
    if (filters.mode) {
      query.paymentMode =
        String(
          filters.mode
        ).toUpperCase();
    }


    if (filters.search) {

      const matchingCustomers =
        await Customer.find({
          company: companyId,
          customerName: {
            $regex: filters.search,
            $options: "i",
          },
        })
          .select("_id")
          .lean();

      query.$or = [

        {
          paymentNumber: {
            $regex:
              filters.search,
            $options: "i",
          },
        },

        {
          referenceNumber: {
            $regex:
              filters.search,
            $options: "i",
          },
        },

        {
          customer: {
            $in: matchingCustomers.map(
              (c) => c._id
            ),
          },
        },

      ];
    }


    const payments =
      await Payment.find(query)

        .populate(
          "customer",
          "customerName"
        )

        .populate(
          "invoice",
          "invoiceNumber total"
        )

        .sort({
          paymentDate: -1,
        })

        .lean();


    // "Received" must follow the same corrected payment-collection
    // convention used elsewhere (payment.repository.js's `collected` stat,
    // ledger.repository.js): PAID + PARTIALLY_PAID are real money in, while
    // PENDING/FAILED/REFUNDED must not inflate it. "Pending" is tracked
    // separately as its own bucket (payments still awaiting completion) so
    // the two never double-count the same rupee.
    const received =
      payments
        .filter(
          (payment) =>
            payment.status === "PAID" ||
            payment.status ===
              "PARTIALLY_PAID"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );


    const pending =
      payments
        .filter(
          (payment) =>
            payment.status ===
            "PENDING"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );


    return {

      payments,

      summary: {

        paymentCount:
          payments.length,

        received,

        pending,

      },

    };
  };


// ======================================================
// TOP CUSTOMERS
// ======================================================

const getTopCustomersRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const query = {
      company: companyId,

      status: {
        $ne: "CANCELLED",
      },
    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {
      query.invoiceDate =
        dateFilter;
    }


    const result =
      await Invoice.aggregate([

        {
          $match: query,
        },

        {
          $group: {

            _id: "$customer",

            totalSales: {
              $sum: {
                $ifNull: [
                  "$total",
                  0,
                ],
              },
            },

            invoiceCount: {
              $sum: 1,
            },

          },
        },

        {
          $sort: {
            totalSales: -1,
          },
        },

        {
          $limit: 10,
        },

        {
          $lookup: {

            from: "customers",

            localField: "_id",

            foreignField: "_id",

            as: "customer",

          },
        },

        {
          $unwind: {

            path: "$customer",

            preserveNullAndEmptyArrays:
              true,

          },
        },

        {
          $project: {

            _id: 1,

            customerName:
              "$customer.customerName",

            // Same authoritative field used by the Outstanding Report and
            // the Customers page — not re-derived here.
            outstanding:
              { $ifNull: ["$customer.outstanding", 0] },

            totalSales: 1,

            invoiceCount: 1,

          },
        },

      ]);


    const trackedBusiness =
      result.reduce(
        (sum, item) =>
          sum +
          Number(item.totalSales || 0),
        0
      );


    return {

      customers: result,

      summary: {

        trackedBusiness,

        customerCount:
          result.length,

        topAccount:
          result[0]
            ?.customerName || null,

      },

    };
  };


// ======================================================
// TOP PRODUCTS
// ======================================================
//
// Uses invoice items.
// Product name is resolved from Product collection.
//
// ======================================================

const getTopProductsRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const query = {
      company: companyId,

      status: {
        $ne: "CANCELLED",
      },
    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {
      query.invoiceDate =
        dateFilter;
    }


    const result =
      await Invoice.aggregate([

        {
          $match: query,
        },

        {
          $unwind: "$items",
        },

        {
          $group: {

            _id:
              "$items.product",

            quantity: {
              $sum: {
                $ifNull: [
                  "$items.quantity",
                  0,
                ],
              },
            },

            revenue: {
              $sum: {
                $ifNull: [
                  "$items.amount",
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
          $limit: 10,
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

            preserveNullAndEmptyArrays:
              true,

          },
        },

        {
          $project: {

            _id: 1,

            productName:
              "$product.productName",

            quantity: 1,

            revenue: 1,

          },
        },

      ]);


    const productRevenue =
      result.reduce(
        (sum, item) =>
          sum +
          Number(item.revenue || 0),
        0
      );


    return {

      products: result,

      summary: {

        productRevenue,

        productCount:
          result.length,

        bestSeller:
          // Best seller = highest revenue (the list is already sorted
          // that way), not highest quantity — a documented, consistent
          // choice per the report spec.
          result[0]
            ?.productName || null,

      },

    };
  };


// ======================================================
// BANK SUMMARY
// ======================================================

// Bank Summary must use the same source of truth as the Bank Dashboard:
// Bank.currentBalance for balances (kept correct on every transaction —
// see bankTransaction.service.js), and "today" defined the same way
// bankDashboard.service.js does (server-local midnight-to-midnight), not
// a date-range filter total re-labelled as "today".
const getBankSummaryRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const banks =
      await Bank.find({

        company: companyId,

        status: "ACTIVE",

      })

        .select(
          [
            "_id",
            "bankName",
            "accountNumber",
            "branchName",
            "accountType",
            "openingBalance",
            "currentBalance",
            "status",
          ].join(" ")
        )

        .sort({
          bankName: 1,
        })

        .lean();


    const bankIds =
      banks.map(
        (bank) => bank._id
      );


    const todayStart =
      new Date();

    todayStart.setHours(
      0,
      0,
      0,
      0
    );


    const todayEnd =
      new Date();

    todayEnd.setHours(
      23,
      59,
      59,
      999
    );


    // ----------------------------------------
    // PER-BANK TODAY CREDIT/DEBIT
    // ----------------------------------------

    const perBankToday =
      await BankTransaction.aggregate([

        {
          $match: {

            company: companyId,

            bankAccount: {
              $in: bankIds,
            },

            transactionDate: {
              $gte: todayStart,
              $lte: todayEnd,
            },

          },
        },

        {
          $group: {

            _id: "$bankAccount",

            todayCredit: {

              $sum: {

                $cond: [
                  { $eq: ["$type", "CREDIT"] },
                  "$amount",
                  0,
                ],

              },

            },

            todayDebit: {

              $sum: {

                $cond: [
                  { $eq: ["$type", "DEBIT"] },
                  "$amount",
                  0,
                ],

              },

            },

          },

        },

      ]);


    const perBankTodayMap =
      new Map(
        perBankToday.map(
          (item) => [
            String(item._id),
            item,
          ]
        )
      );


    // ----------------------------------------
    // OPTIONAL DATE-RANGE STATS (reconciliation
    // / transaction-count context, independent
    // of the "today" cards)
    // ----------------------------------------

    const transactionQuery = {

      company: companyId,

      bankAccount: {
        $in: bankIds,
      },

    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {

      transactionQuery.transactionDate =
        dateFilter;

    }


    const result =
      await BankTransaction.aggregate([

        {
          $match:
            transactionQuery,
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

          },

        },

      ]);


    const stats =
      result[0] || {

        totalTransactions: 0,

        totalCredit: 0,

        totalDebit: 0,

        reconciled: 0,

        unreconciled: 0,

      };


    // Company-wide totals (cards) — computed from every active bank,
    // regardless of the search filter, so searching the table never
    // changes the summary cards (matching Bank Dashboard's behaviour).
    const banksWithToday =
      banks.map(
        (bank) => {

          const today =
            perBankTodayMap.get(
              String(bank._id)
            ) || {
              todayCredit: 0,
              todayDebit: 0,
            };

          return {

            ...bank,

            todayCredit:
              today.todayCredit,

            todayDebit:
              today.todayDebit,

          };
        }
      );


    const totalBalance =
      banks.reduce(
        (sum, bank) =>
          sum +
          Number(
            bank.currentBalance || 0
          ),
        0
      );


    const totalOpeningBalance =
      banks.reduce(
        (sum, bank) =>
          sum +
          Number(
            bank.openingBalance || 0
          ),
        0
      );


    const todayCredit =
      banksWithToday.reduce(
        (sum, bank) =>
          sum + bank.todayCredit,
        0
      );


    const todayDebit =
      banksWithToday.reduce(
        (sum, bank) =>
          sum + bank.todayDebit,
        0
      );


    // Table rows only — filtered by search, applied after the summary
    // cards above have already been computed from the full list.
    let filteredBanks =
      banksWithToday;

    if (filters.search) {

      const search =
        String(filters.search)
          .trim()
          .toLowerCase();

      filteredBanks =
        filteredBanks.filter(
          (bank) =>
            String(bank.bankName || "")
              .toLowerCase()
              .includes(search) ||
            String(
              bank.accountNumber || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              bank.branchName || ""
            )
              .toLowerCase()
              .includes(search)
        );
    }


    return {

      summary: {

        bankCount:
          banks.length,

        totalBalance,

        totalOpeningBalance,

        todayCredit,

        todayDebit,

        totalTransactions:
          stats.totalTransactions,

        totalCredit:
          stats.totalCredit,

        totalDebit:
          stats.totalDebit,

        netMovement:
          Number(
            stats.totalCredit || 0
          ) -
          Number(
            stats.totalDebit || 0
          ),

        reconciled:
          stats.reconciled,

        unreconciled:
          stats.unreconciled,

      },

      banks:
        filteredBanks,

    };
  };


// ======================================================
// QUOTATION CONVERSION
// ======================================================

const getQuotationConversionRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const query = {

      company: companyId,

    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {

      query.quotationDate =
        dateFilter;

    }


    const result =
      await Quotation.aggregate([

        {
          $match: query,
        },

        {
          $group: {

            _id: null,

            total: {
              $sum: 1,
            },

            draft: {

              $sum: {

                $cond: [

                  {
                    $eq: [
                      "$status",
                      "DRAFT",
                    ],
                  },

                  1,

                  0,

                ],

              },

            },

            sent: {

              $sum: {

                $cond: [

                  {
                    $eq: [
                      "$status",
                      "SENT",
                    ],
                  },

                  1,

                  0,

                ],

              },

            },

            approved: {

              $sum: {

                $cond: [

                  {
                    $eq: [
                      "$status",
                      "APPROVED",
                    ],
                  },

                  1,

                  0,

                ],

              },

            },

            rejected: {

              $sum: {

                $cond: [

                  {
                    $eq: [
                      "$status",
                      "REJECTED",
                    ],
                  },

                  1,

                  0,

                ],

              },

            },

            expired: {

              $sum: {

                $cond: [

                  {
                    $eq: [
                      "$status",
                      "EXPIRED",
                    ],
                  },

                  1,

                  0,

                ],

              },

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

            totalValue: {

              $sum: {

                $ifNull: [
                  "$total",
                  0,
                ],

              },

            },

            convertedValue: {

              $sum: {

                $cond: [

                  {
                    $eq: [
                      "$status",
                      "CONVERTED",
                    ],
                  },

                  {
                    $ifNull: [
                      "$total",
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


    // Per-status rows for the reference UI's Status/Count/Share/Value
    // table (and for CSV/Excel/PDF export, which needs one row per status
    // rather than a single flat stats object).
    const perStatus =
      await Quotation.aggregate([

        {
          $match: query,
        },

        {
          $group: {

            _id: "$status",

            count: {
              $sum: 1,
            },

            value: {
              $sum: {
                $ifNull: ["$total", 0],
              },
            },

          },
        },

      ]);


    const perStatusMap =
      new Map(
        perStatus.map(
          (item) => [item._id, item]
        )
      );


    const data =
      result[0] || {

        total: 0,
        draft: 0,
        sent: 0,
        approved: 0,
        rejected: 0,
        expired: 0,
        converted: 0,
        totalValue: 0,
        convertedValue: 0,

      };


    const conversionRate =
      data.total > 0
        ? (
            data.converted /
            data.total
          ) * 100
        : 0;


    const statuses = [
      "DRAFT",
      "SENT",
      "APPROVED",
      "CONVERTED",
      "REJECTED",
      "EXPIRED",
    ].map(
      (status) => {

        const item =
          perStatusMap.get(status) || {
            count: 0,
            value: 0,
          };

        return {

          status,

          count:
            item.count,

          share:
            data.total > 0
              ? Number(
                  (
                    (item.count /
                      data.total) *
                    100
                  ).toFixed(2)
                )
              : 0,

          value:
            item.value,

        };
      }
    );


    return {

      totalQuotations:
        data.total,

      draft:
        data.draft,

      sent:
        data.sent,

      approved:
        data.approved,

      rejected:
        data.rejected,

      expired:
        data.expired,

      converted:
        data.converted,

      totalValue:
        data.totalValue,

      convertedValue:
        data.convertedValue,

      conversionRate:
        Number(
          conversionRate.toFixed(2)
        ),

      statuses,

    };
  };


// ======================================================
// EXPORT
// ======================================================

export {

  getDailySalesRepository,

  getMonthlySalesRepository,

  getQuotationReportRepository,

  getGSTReportRepository,

  getOutstandingReportRepository,

  getPaymentReportRepository,

  getTopCustomersRepository,

  getTopProductsRepository,

  getBankSummaryRepository,

  getQuotationConversionRepository,

};