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

  getBankSummaryRepository,

  getQuotationConversionRepository,

} from "../repositories/report.repository.js";

// The Ledger Report is a module-level summary (Customer/Cash/GST Ledger:
// Opening/Debit/Credit/Closing) — it reuses each ledger's own already-
// correct, already-fixed service rather than re-deriving invoice/payment
// totals a fourth time (see report.repository.js's removed
// getLedgerSourceRepository, which duplicated ledger.repository.js and was
// missing the PAID/PARTIALLY_PAID payment-status filter that module has).
import { getCompanyLedger } from "./ledger.service.js";
import { getCashLedgerStats } from "./cashLedger.service.js";
import { getGSTLedger } from "./gstLedger.service.js";


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
  user,
  filters = {}
) => {

  validateCompany(user);

  return await getOutstandingReportRepository(
    user.company,
    filters
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

// Module-level summary (Module | Opening | Debit | Credit | Closing) —
// matches the reference UI exactly. Each module row reads its numbers from
// that module's own already-correct service, so there is exactly one place
// that computes "customer ledger totals," one place for "cash ledger
// totals," and one for "GST ledger totals" — this function only composes
// them, it never recalculates any of them itself. Supplier Ledger is
// intentionally omitted — no such module exists in the backend.
const getLedgerReport = async (
  user,
  filters = {}
) => {

  validateCompany(user);


  const [
    customerLedger,
    cashLedgerStats,
    gstLedger,
  ] = await Promise.all([

    getCompanyLedger(
      user,
      {
        search: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 1,
      }
    ),

    getCashLedgerStats(user),

    getGSTLedger(
      user,
      {
        search: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 1,
      }
    ),

  ]);


  // Cash Ledger's own convention: CREDIT increases balance, DEBIT
  // decreases it (see cashLedger.service.js) — reverse the running total
  // to recover its opening balance without a second query.
  const cashOpening =
    Number(cashLedgerStats.closingBalance || 0) -
    Number(cashLedgerStats.totalCredit || 0) +
    Number(cashLedgerStats.totalDebit || 0);


  const modules = [

    {

      module: "Customer Ledger",

      opening:
        Number(
          customerLedger.openingBalance || 0
        ),

      debit:
        Number(
          customerLedger.totalDebit || 0
        ),

      credit:
        Number(
          customerLedger.totalCredit || 0
        ),

      closing:
        Number(
          customerLedger.closingBalance || 0
        ),

    },

    {

      module: "Cash Ledger",

      opening: cashOpening,

      debit:
        Number(
          cashLedgerStats.totalDebit || 0
        ),

      credit:
        Number(
          cashLedgerStats.totalCredit || 0
        ),

      closing:
        Number(
          cashLedgerStats.closingBalance || 0
        ),

    },

    {

      module: "GST Ledger",

      opening:
        Number(
          gstLedger.openingBalance || 0
        ),

      debit:
        Number(
          gstLedger.summary?.totalDebit || 0
        ),

      credit:
        Number(
          gstLedger.summary?.totalCredit || 0
        ),

      closing:
        Number(
          gstLedger.summary?.closingBalance || 0
        ),

    },

  ];


  const totalDebit =
    modules.reduce(
      (sum, item) =>
        sum + item.debit,
      0
    );


  const totalCredit =
    modules.reduce(
      (sum, item) =>
        sum + item.credit,
      0
    );


  return {

    modules,

    summary: {

      totalDebit,

      totalCredit,

      moduleCount:
        modules.length,

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