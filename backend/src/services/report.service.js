import ApiError from "../exceptions/ApiError.js";

import {

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

} from "../repositories/report.repository.js";


// ======================================================
// VALIDATE COMPANY
// ======================================================

const validateCompany = (user) => {

  if (!user?.company) {

    throw new ApiError(
      401,
      "User company information is missing."
    );

  }

};


// ======================================================
// DAILY SALES
// ======================================================

const getDailySales = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getDailySalesRepository(
    user.company,
    filters
  );

};


// ======================================================
// MONTHLY SALES
// ======================================================

const getMonthlySales = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getMonthlySalesRepository(
    user.company,
    filters
  );

};


// ======================================================
// QUOTATION REPORT
// ======================================================

const getQuotationReport = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getQuotationReportRepository(
    user.company,
    filters
  );

};


// ======================================================
// GST REPORT
// ======================================================

const getGSTReport = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getGSTReportRepository(
    user.company,
    filters
  );

};


// ======================================================
// OUTSTANDING REPORT
// ======================================================

const getOutstandingReport = async (
  user
) => {

  validateCompany(user);

  return await getOutstandingReportRepository(
    user.company
  );

};


// ======================================================
// PAYMENT REPORT
// ======================================================

const getPaymentReport = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getPaymentReportRepository(
    user.company,
    filters
  );

};


// ======================================================
// TOP CUSTOMERS
// ======================================================

const getTopCustomers = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getTopCustomersRepository(
    user.company,
    filters
  );

};


// ======================================================
// TOP PRODUCTS
// ======================================================

const getTopProducts = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getTopProductsRepository(
    user.company,
    filters
  );

};


// ======================================================
// LEDGER REPORT
// ======================================================

const getLedgerReport = async (
  user,
  filters = {}
) => {

  validateCompany(user);


  const {
    invoices,
    payments,
  } =
    await getLedgerSourceRepository(
      user.company,
      filters
    );


  const entries = [];


  // ----------------------------------------
  // INVOICES = DEBIT
  // ----------------------------------------

  for (
    const invoice of invoices
  ) {

    entries.push({

      date:
        invoice.invoiceDate,

      particular:
        `Sales Invoice ${
          invoice.invoiceNumber
        }`,

      account:
        invoice.customer
          ?.customerName ||
        "Customer",

      reference:
        invoice.invoiceNumber,

      debit:
        Number(
          invoice.total || 0
        ),

      credit: 0,

      type: "DEBIT",

      source: "INVOICE",

      sourceId:
        invoice._id,

    });

  }


  // ----------------------------------------
  // PAYMENTS = CREDIT
  // ----------------------------------------

  for (
    const payment of payments
  ) {

    entries.push({

      date:
        payment.paymentDate,

      particular:
        `Receipt ${
          payment.paymentMethod ||
          ""
        }`.trim(),

      account:
        payment.customer
          ?.customerName ||
        "Customer",

      reference:
        payment.referenceNumber ||
        payment.paymentNumber ||
        null,

      debit: 0,

      credit:
        Number(
          payment.amount || 0
        ),

      type: "CREDIT",

      source: "PAYMENT",

      sourceId:
        payment._id,

    });

  }


  // ----------------------------------------
  // SORT
  // ----------------------------------------

  entries.sort(
    (a, b) => {

      const difference =
        new Date(a.date).getTime() -
        new Date(b.date).getTime();


      if (difference !== 0) {
        return difference;
      }


      return String(
        a.sourceId
      ).localeCompare(
        String(b.sourceId)
      );

    }
  );


  // ----------------------------------------
  // SUMMARY BEFORE FILTER
  // ----------------------------------------

  const totalDebit =
    entries.reduce(
      (sum, entry) =>
        sum +
        Number(
          entry.debit || 0
        ),
      0
    );


  const totalCredit =
    entries.reduce(
      (sum, entry) =>
        sum +
        Number(
          entry.credit || 0
        ),
      0
    );


  const closingBalance =
    totalDebit -
    totalCredit;


  // ----------------------------------------
  // RUNNING BALANCE
  // ----------------------------------------

  let balance = 0;


  const entriesWithBalance =
    entries.map(
      (entry) => {

        balance +=
          Number(
            entry.debit || 0
          );

        balance -=
          Number(
            entry.credit || 0
          );


        return {
          ...entry,
          balance,
        };

      }
    );


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  let filtered =
    [...entriesWithBalance];


  if (filters.search) {

    const search =
      String(
        filters.search
      )
        .trim()
        .toLowerCase();


    filtered =
      filtered.filter(
        (entry) => (

          String(
            entry.particular || ""
          )
            .toLowerCase()
            .includes(search)

          ||

          String(
            entry.account || ""
          )
            .toLowerCase()
            .includes(search)

          ||

          String(
            entry.reference || ""
          )
            .toLowerCase()
            .includes(search)

        )
      );

  }


  // ----------------------------------------
  // TYPE FILTER
  // ----------------------------------------

  if (filters.type) {

    const type =
      String(
        filters.type
      ).toUpperCase();


    if (
      ![
        "DEBIT",
        "CREDIT",
      ].includes(type)
    ) {

      throw new ApiError(
        400,
        "Invalid ledger type. Use DEBIT or CREDIT."
      );

    }


    filtered =
      filtered.filter(
        (entry) =>
          entry.type === type
      );

  }


  // ----------------------------------------
  // PAGINATION
  // ----------------------------------------

  const page =
    Math.max(
      Number(
        filters.page
      ) || 1,
      1
    );


  const limit =
    Math.min(
      Math.max(
        Number(
          filters.limit
        ) || 10,
        1
      ),
      100
    );


  const total =
    filtered.length;


  const totalPages =
    Math.ceil(
      total / limit
    );


  const skip =
    (page - 1) *
    limit;


  return {

    summary: {

      openingBalance: 0,

      totalDebit,

      totalCredit,

      closingBalance,

      entriesCount:
        entries.length,

    },


    openingBalance: 0,

    totalDebit,

    totalCredit,

    closingBalance,

    entriesCount:
      entries.length,


    entries:
      filtered.slice(
        skip,
        skip + limit
      ),


    pagination: {

      page,

      limit,

      total,

      totalPages,

    },

  };

};


// ======================================================
// BANK SUMMARY
// ======================================================

const getBankSummary = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getBankSummaryRepository(
    user.company,
    filters
  );

};


// ======================================================
// QUOTATION CONVERSION
// ======================================================

const getQuotationConversion = async (
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getQuotationConversionRepository(
    user.company,
    filters
  );

};


// ======================================================
// EXPORT
// ======================================================

export {

  getDailySales,

  getMonthlySales,

  getQuotationReport,

  getGSTReport,

  getOutstandingReport,

  getLedgerReport,

  getBankSummary,

  getPaymentReport,

  getTopCustomers,

  getTopProducts,

  getQuotationConversion,

};