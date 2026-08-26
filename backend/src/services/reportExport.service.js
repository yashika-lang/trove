import ApiError from "../exceptions/ApiError.js";

import {
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
} from "./report.service.js";

import {
  convertToCSV,
} from "../utils/csvExport.js";

import {
  convertToExcel,
} from "../utils/excelExport.js";

import {
  convertToPDF,
} from "../utils/pdfExport.js";


// ==========================================
// REPORT CONFIGURATION
// ==========================================

const REPORT_CONFIG = {

  // ----------------------------------------
  // SALES
  // ----------------------------------------

  "daily-sales": {
    title: "Daily Sales Report",
    service: getDailySales,
  },

  "monthly-sales": {
    title: "Monthly Sales Report",
    service: getMonthlySales,
  },

  "quotations": {
    title: "Quotation Report",
    service: getQuotationReport,
  },


  // ----------------------------------------
  // FINANCE
  // ----------------------------------------

  "gst": {
    title: "GST Report",
    service: getGSTReport,
  },

  "outstanding": {
    title: "Outstanding Report",
    service: getOutstandingReport,
  },

  "ledger": {
    title: "Ledger Report",
    service: getLedgerReport,
  },

  "bank-summary": {
    title: "Bank Summary Report",
    service: getBankSummary,
  },

  "payments": {
    title: "Payment Report",
    service: getPaymentReport,
  },


  // ----------------------------------------
  // INSIGHTS
  // ----------------------------------------

  "top-customers": {
    title: "Top Customers Report",
    service: getTopCustomers,
  },

  "top-products": {
    title: "Top Products Report",
    service: getTopProducts,
  },

  "quotation-conversion": {
    title: "Quotation Conversion Report",
    service: getQuotationConversion,
  },

};


// ==========================================
// GET REPORT CONFIG
// ==========================================

const getReportConfig = (
  reportName
) => {

  const normalizedName =
    String(reportName || "")
      .trim()
      .toLowerCase();


  const config =
    REPORT_CONFIG[
      normalizedName
    ];


  if (!config) {

    throw new ApiError(
      400,
      `Unsupported report: ${reportName}`
    );
  }


  return config;
};


// ==========================================
// EXTRACT ROWS
// ==========================================

const extractRows = (
  report
) => {

  if (
    Array.isArray(report)
  ) {
    return report;
  }


  if (
    !report ||
    typeof report !== "object"
  ) {
    return [];
  }


  const possibleKeys = [

    "entries",

    "transactions",

    "records",

    "data",

    "results",

    "quotations",

    "payments",

    "customers",

    "products",

    "invoices",

    "rows",

    // Module-level / composite report shapes (Ledger Report, Bank
    // Summary, Quotation Conversion) — without these, extractRows falls
    // through to wrapping the whole response object as a single export
    // row instead of one row per module/bank/status.
    "modules",

    "banks",

    "statuses",

  ];


  for (
    const key of possibleKeys
  ) {

    if (
      Array.isArray(
        report[key]
      )
    ) {

      return report[key];

    }
  }


  // ----------------------------------------
  // OBJECT REPORT
  // ----------------------------------------

  return [
    report,
  ];
};


// ==========================================
// FLATTEN OBJECT
// ==========================================

const flattenObject = (
  object,
  prefix = "",
  result = {}
) => {

  if (
    object === null ||
    object === undefined
  ) {

    return result;

  }


  if (
    object instanceof Date
  ) {

    result[prefix] =
      object.toISOString();

    return result;
  }


  // Mongoose/BSON ObjectId (e.g. a raw `_id` or populated ref field from a
  // .lean() document) is technically an object with an internal Buffer —
  // without this check it gets recursed into and shredded into a dozen
  // garbage "prefix Buffer 0..11" columns instead of one clean id string.
  // Every real ObjectId implementation exposes toHexString().
  if (
    typeof object.toHexString ===
    "function"
  ) {

    result[prefix] =
      object.toHexString();

    return result;
  }


  if (
    typeof object !== "object"
  ) {

    result[prefix] =
      object;

    return result;
  }


  if (
    Array.isArray(object)
  ) {

    result[prefix] =
      object
        .map(
          (item) =>
            typeof item === "object"
              ? JSON.stringify(item)
              : item
        )
        .join(", ");

    return result;
  }


  for (
    const [
      key,
      value
    ]
    of Object.entries(object)
  ) {

    const newKey =
      prefix
        ? `${prefix}.${key}`
        : key;


    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {

      flattenObject(
        value,
        newKey,
        result
      );

    } else {

      result[newKey] =
        value instanceof Date
          ? value.toISOString()
          : value;

    }
  }


  return result;
};


// ==========================================
// PREPARE ROWS
// ==========================================

const prepareRows = (
  rows
) => {

  return rows.map(
    (row) =>
      flattenObject(row)
  );

};


// ==========================================
// FORMAT LABEL
// ==========================================

const formatLabel = (
  value
) => {

  return String(value)

    .replace(
      /\./g,
      " "
    )

    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )

    .replace(
      /_/g,
      " "
    )

    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

};


// ==========================================
// BUILD FIELDS
// ==========================================

const buildFields = (
  rows
) => {

  const keys =
    new Set();


  for (
    const row of rows
  ) {

    Object.keys(row)
      .forEach(
        (key) =>
          keys.add(key)
      );

  }


  return Array.from(keys)
    .map(
      (key) => ({

        label:
          formatLabel(key),

        value:
          key,

      })
    );

};


// ==========================================
// EXPORT REPORT
// ==========================================

const exportReport = async (
  reportName,
  format,
  user,
  filters = {}
) => {

  // ========================================
  // VALIDATE COMPANY
  // ========================================

  if (
    !user?.company
  ) {

    throw new ApiError(
      401,
      "User company information is missing."
    );

  }


  // ========================================
  // GET CONFIG
  // ========================================

  const config =
    getReportConfig(
      reportName
    );


  // ========================================
  // FORMAT
  // ========================================

  const normalizedFormat =
    String(
      format || "csv"
    )
      .trim()
      .toLowerCase();


  if (
    ![
      "csv",
      "excel",
      "xlsx",
      "pdf",
    ].includes(
      normalizedFormat
    )
  ) {

    throw new ApiError(
      400,
      "Invalid export format. Use csv, excel, xlsx or pdf."
    );

  }


  // ========================================
  // GET ACTUAL REPORT DATA
  // ========================================

  const report =
    await config.service(
      user,
      filters
    );


  // ========================================
  // PREPARE DATA
  // ========================================

  const rawRows =
    extractRows(report);


  const rows =
    prepareRows(
      rawRows
    );


  const fields =
    buildFields(
      rows
    );


  // ========================================
  // FILE BASE NAME
  // ========================================
  // e.g. "daily-sales-2026-08-22"

  const todayISO =
    new Date()
      .toISOString()
      .slice(0, 10);

  const baseName =
    `${reportName}-${todayISO}`;


  // ========================================
  // CSV
  // ========================================

  if (
    normalizedFormat === "csv"
  ) {

    const csv =
      convertToCSV(
        rows,
        fields
      );


    return {

      buffer:
        Buffer.from(
          csv,
          "utf-8"
        ),

      contentType:
        "text/csv; charset=utf-8",

      filename:
        `${baseName}.csv`,

    };

  }


  // ========================================
  // EXCEL
  // ========================================

  if (
    normalizedFormat === "excel" ||
    normalizedFormat === "xlsx"
  ) {

    const buffer =
      await convertToExcel(
        rows,
        fields,
        config.title
      );


    return {

      buffer,

      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      filename:
        `${baseName}.xlsx`,

    };

  }


  // ========================================
  // PDF
  // ========================================

  const buffer =
    await convertToPDF(
      rows,
      fields,
      config.title
    );


  return {

    buffer,

    contentType:
      "application/pdf",

    filename:
      `${baseName}.pdf`,

  };

};


export {
  exportReport,
};