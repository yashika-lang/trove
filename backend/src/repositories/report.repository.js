import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import Quotation from "../models/quotation.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import GSTTransaction from "../models/gstTransaction.model.js";
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

          sales: {
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
      totalSales,
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

      query.$or = [

        {
          quotationNumber: {
            $regex:
              filters.search,
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


    return {

      quotations,

      summary: {

        total:
          quotations.length,

        converted,

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

const getGSTReportRepository = async (
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
    query.date =
      dateFilter;
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
        gstin: {
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

    ];
  }


  const result =
    await GSTTransaction.aggregate([

      {
        $match: query,
      },

      {
        $group: {

          _id: "$type",

          taxableAmount: {
            $sum: {
              $ifNull: [
                "$taxableAmount",
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

          cess: {
            $sum: {
              $ifNull: [
                "$cess",
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

          totalAmount: {
            $sum: {
              $ifNull: [
                "$totalAmount",
                0,
              ],
            },
          },

          transactionCount: {
            $sum: 1,
          },

        },
      },

    ]);


  const outward =
    result.find(
      (item) =>
        item._id === "OUTWARD"
    ) || {
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      totalTax: 0,
      totalAmount: 0,
      transactionCount: 0,
    };


  const inward =
    result.find(
      (item) =>
        item._id === "INWARD"
    ) || {
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      totalTax: 0,
      totalAmount: 0,
      transactionCount: 0,
    };


  return {

    outward,

    inward,

    netTaxPayable:
      Number(outward.totalTax || 0) -
      Number(inward.totalTax || 0),

  };
};


// ======================================================
// OUTSTANDING REPORT
// ======================================================

const getOutstandingReportRepository =
  async (companyId) => {

    const result =
      await Invoice.aggregate([

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

            _id: "$customer",

            outstanding: {
              $sum: {
                $ifNull: [
                  "$balanceDue",
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
            outstanding: -1,
          },
        },

      ]);


    return {
      data: result,

      summary: {

        totalOutstanding:
          result.reduce(
            (sum, item) =>
              sum +
              Number(
                item.outstanding || 0
              ),
            0
          ),

        customers:
          result.length,

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


    if (filters.mode) {
      query.paymentMethod =
        String(
          filters.mode
        ).toUpperCase();
    }


    if (filters.search) {

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


    const totalAmount =
      payments.reduce(
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

        totalAmount,

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

            totalSales: 1,

            invoiceCount: 1,

          },
        },

      ]);


    return result;
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


    return result;
  };


// ======================================================
// LEDGER SOURCE
// ======================================================
//
// Invoice = DEBIT
// Payment = CREDIT
//
// No ledger.model.js required.
// ======================================================

const getLedgerSourceRepository =
  async (
    companyId,
    filters = {}
  ) => {

    const invoiceQuery = {

      company: companyId,

      status: {
        $ne: "CANCELLED",
      },

    };


    const paymentQuery = {

      company: companyId,

    };


    const dateFilter =
      buildDateFilter(
        filters.startDate,
        filters.endDate
      );


    if (dateFilter) {

      invoiceQuery.invoiceDate =
        dateFilter;

      paymentQuery.paymentDate =
        dateFilter;
    }


    if (filters.customer) {

      invoiceQuery.customer =
        filters.customer;

      paymentQuery.customer =
        filters.customer;
    }


    const [
      invoices,
      payments,
    ] = await Promise.all([

      Invoice.find(
        invoiceQuery
      )

        .populate(
          "customer",
          "customerName phone email"
        )

        .select(
          [
            "_id",
            "invoiceNumber",
            "customer",
            "invoiceDate",
            "total",
            "amountPaid",
            "balanceDue",
            "status",
            "createdAt",
          ].join(" ")
        )

        .sort({
          invoiceDate: 1,
          createdAt: 1,
        })

        .lean(),


      Payment.find(
        paymentQuery
      )

        .populate(
          "customer",
          "customerName phone email"
        )

        .populate(
          "invoice",
          "invoiceNumber total"
        )

        .select(
          [
            "_id",
            "customer",
            "invoice",
            "amount",
            "paymentDate",
            "paymentMethod",
            "paymentNumber",
            "referenceNumber",
            "status",
            "createdAt",
          ].join(" ")
        )

        .sort({
          paymentDate: 1,
          createdAt: 1,
        })

        .lean(),

    ]);


    return {
      invoices,
      payments,
    };
  };


// ======================================================
// BANK SUMMARY
// ======================================================

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


    const transactionQuery = {

      company: companyId,

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


    return {

      summary: {

        bankCount:
          banks.length,

        totalBalance,

        totalOpeningBalance,

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

      banks,

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


    if (!result.length) {

      return {

        totalQuotations: 0,

        draft: 0,

        sent: 0,

        approved: 0,

        rejected: 0,

        expired: 0,

        converted: 0,

        totalValue: 0,

        convertedValue: 0,

        conversionRate: 0,

      };

    }


    const data =
      result[0];


    const conversionRate =
      data.total > 0
        ? (
            data.converted /
            data.total
          ) * 100
        : 0;


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

  getLedgerSourceRepository,

  getBankSummaryRepository,

  getQuotationConversionRepository,

};