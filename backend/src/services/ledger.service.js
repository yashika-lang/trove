import ApiError from "../exceptions/ApiError.js";

import {
  getCustomerLedgerSourceData,
  getCompanyLedgerSourceData,
  getCustomerOpeningData,
} from "../repositories/ledger.repository.js";


// ==========================================
// BUILD CUSTOMER LEDGER ENTRIES
// ==========================================

const buildCustomerLedgerEntries = ({
  invoices = [],
  payments = [],
}) => {

  const entries = [];

  // ----------------------------------------
  // SALES INVOICES
  // Invoice = DEBIT
  // ----------------------------------------

  for (const invoice of invoices) {

    entries.push({
      date: invoice.invoiceDate,

      particular:
        `Sales Invoice ${invoice.invoiceNumber}`,

      account:
        invoice.customer?.customerName ||
        "Customer",

      referenceNumber:
        invoice.invoiceNumber,

      type: "DEBIT",

      debit: Number(invoice.total || 0),

      credit: 0,

      source: "INVOICE",

      sourceId: invoice._id,
    });
  }


  // ----------------------------------------
  // PAYMENTS / RECEIPTS
  // Payment = CREDIT
  // ----------------------------------------

  for (const payment of payments) {

    let particular = "Receipt";

    if (payment.paymentMethod) {
      particular =
        `Receipt ${payment.paymentMethod}`;
    }

    entries.push({
      date: payment.paymentDate,

      particular,

      account:
        payment.customer?.customerName ||
        "Customer",

      referenceNumber:
        payment.referenceNumber ||
        payment.paymentNumber ||
        null,

      type: "CREDIT",

      debit: 0,

      credit: Number(payment.amount || 0),

      source: "PAYMENT",

      sourceId: payment._id,
    });
  }


  // ----------------------------------------
  // SORT CHRONOLOGICALLY
  // ----------------------------------------

  entries.sort((a, b) => {

    const dateDifference =
      new Date(a.date).getTime() -
      new Date(b.date).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return (
      String(a.sourceId)
        .localeCompare(
          String(b.sourceId)
        )
    );
  });


  return entries;
};


// ==========================================
// APPLY RUNNING BALANCE
// ==========================================

const applyRunningBalance = (
  entries,
  openingBalance = 0
) => {

  let balance =
    Number(openingBalance) || 0;

  return entries.map((entry) => {

    balance +=
      Number(entry.debit || 0);

    balance -=
      Number(entry.credit || 0);

    return {
      ...entry,

      balance,
    };
  });
};


// ==========================================
// FILTER LEDGER ENTRIES
// ==========================================

const filterLedgerEntries = (
  entries,
  filters = {}
) => {

  let result = [...entries];


  // ----------------------------------------
  // TYPE FILTER
  // ----------------------------------------

  if (filters.type) {

    const type =
      String(filters.type)
        .toUpperCase();

    if (
      !["DEBIT", "CREDIT"].includes(type)
    ) {
      throw new ApiError(
        400,
        "Invalid ledger type. Use DEBIT or CREDIT."
      );
    }

    result = result.filter(
      (entry) =>
        entry.type === type
    );
  }


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  if (filters.search) {

    const search =
      String(filters.search)
        .trim()
        .toLowerCase();

    result = result.filter(
      (entry) => {

        return (
          String(
            entry.particular || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            entry.account || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            entry.referenceNumber || ""
          )
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }


  return result;
};


// ==========================================
// PAGINATION
// ==========================================

const paginateEntries = (
  entries,
  page,
  limit
) => {

  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const perPage =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      100
    );

  const total =
    entries.length;

  const totalPages =
    Math.ceil(
      total / perPage
    );

  const skip =
    (currentPage - 1) *
    perPage;

  return {
    entries: entries.slice(
      skip,
      skip + perPage
    ),

    pagination: {
      page: currentPage,

      limit: perPage,

      total,

      totalPages,
    },
  };
};


// ==========================================
// CALCULATE SUMMARY
// ==========================================

const calculateSummary = (
  entries,
  openingBalance = 0
) => {

  const totalDebit =
    entries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.debit || 0),
      0
    );

  const totalCredit =
    entries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.credit || 0),
      0
    );

  const closingBalance =
    Number(openingBalance) +
    totalDebit -
    totalCredit;


  return {
    openingBalance:
      Number(openingBalance) || 0,

    totalDebit,

    totalCredit,

    closingBalance,

    entriesCount:
      entries.length,
  };
};


// ==========================================
// CUSTOMER LEDGER
// ==========================================

const getCustomerLedger = async (
  customerId,
  user,
  filters = {}
) => {

  if (!customerId) {
    throw new ApiError(
      400,
      "Customer ID is required."
    );
  }


  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ----------------------------------------
  // GET SOURCE DATA
  // ----------------------------------------

  const {
    invoices,
    payments,
  } =
    await getCustomerLedgerSourceData(
      user.company,
      customerId,
      filters
    );


  // ----------------------------------------
  // OPENING BALANCE
  // ----------------------------------------

  let openingBalance = 0;

  if (filters.startDate) {

    const openingData =
      await getCustomerOpeningData(
        user.company,
        customerId,
        filters.startDate
      );

    openingBalance =
      openingData.openingBalance;
  }


  // ----------------------------------------
  // BUILD ENTRIES
  // ----------------------------------------

  let entries =
    buildCustomerLedgerEntries({
      invoices,
      payments,
    });


  // ----------------------------------------
  // FILTER
  // ----------------------------------------

  entries =
    filterLedgerEntries(
      entries,
      filters
    );


  // ----------------------------------------
  // RUNNING BALANCE
  // ----------------------------------------

  entries =
    applyRunningBalance(
      entries,
      openingBalance
    );


  // ----------------------------------------
  // SUMMARY
  // ----------------------------------------

  const summary =
    calculateSummary(
      entries,
      openingBalance
    );


  // ----------------------------------------
  // PAGINATION
  // ----------------------------------------

  const paginationData =
    paginateEntries(
      entries,
      filters.page,
      filters.limit
    );


  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return {

    summary,

    openingBalance,

    totalDebit:
      summary.totalDebit,

    totalCredit:
      summary.totalCredit,

    closingBalance:
      summary.closingBalance,

    entriesCount:
      summary.entriesCount,

    entries:
      paginationData.entries,

    pagination:
      paginationData.pagination,
  };
};


// ==========================================
// COMPANY LEDGER
// ==========================================

const getCompanyLedger = async (
  user,
  filters = {}
) => {

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ----------------------------------------
  // GET COMPANY SOURCE DATA
  // ----------------------------------------

  const {
    invoices,
    payments,
  } =
    await getCompanyLedgerSourceData(
      user.company,
      filters
    );


  // ----------------------------------------
  // BUILD ENTRIES
  // ----------------------------------------

  let entries =
    buildCustomerLedgerEntries({
      invoices,
      payments,
    });


  // ----------------------------------------
  // FILTER
  // ----------------------------------------

  entries =
    filterLedgerEntries(
      entries,
      filters
    );


  // ----------------------------------------
  // RUNNING BALANCE
  // ----------------------------------------

  entries =
    applyRunningBalance(
      entries,
      0
    );


  // ----------------------------------------
  // SUMMARY
  // ----------------------------------------

  const summary =
    calculateSummary(
      entries,
      0
    );


  // ----------------------------------------
  // PAGINATION
  // ----------------------------------------

  const paginationData =
    paginateEntries(
      entries,
      filters.page,
      filters.limit
    );


  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return {

    summary,

    openingBalance: 0,

    totalDebit:
      summary.totalDebit,

    totalCredit:
      summary.totalCredit,

    closingBalance:
      summary.closingBalance,

    entriesCount:
      summary.entriesCount,

    entries:
      paginationData.entries,

    pagination:
      paginationData.pagination,
  };
};


export {
  getCustomerLedger,
  getCompanyLedger,
};