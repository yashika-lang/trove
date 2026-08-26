import axiosClient from "./axiosClient";

// Maps to backend/src/routes/report.routes.js and reportExport.routes.js
// (Admin + Accountant). Every report is backend-aggregated — this file
// only forwards filters and unwraps the response envelope.
export const getDailySalesApi = (params = {}) =>
  axiosClient.get("/reports/daily-sales", { params }).then((res) => res.data.data);

export const getMonthlySalesApi = (params = {}) =>
  axiosClient.get("/reports/monthly-sales", { params }).then((res) => res.data.data);

export const getQuotationReportApi = (params = {}) =>
  axiosClient.get("/reports/quotations", { params }).then((res) => res.data.data);

export const getGstReportApi = (params = {}) =>
  axiosClient.get("/reports/gst", { params }).then((res) => res.data.data);

export const getOutstandingReportApi = (params = {}) =>
  axiosClient.get("/reports/outstanding", { params }).then((res) => res.data.data);

export const getLedgerReportApi = (params = {}) =>
  axiosClient.get("/reports/ledger", { params }).then((res) => res.data.data);

export const getBankSummaryReportApi = (params = {}) =>
  axiosClient.get("/reports/bank-summary", { params }).then((res) => res.data.data);

export const getPaymentReportApi = (params = {}) =>
  axiosClient.get("/reports/payments", { params }).then((res) => res.data.data);

export const getTopCustomersApi = (params = {}) =>
  axiosClient.get("/reports/top-customers", { params }).then((res) => res.data.data);

export const getTopProductsApi = (params = {}) =>
  axiosClient.get("/reports/top-products", { params }).then((res) => res.data.data);

export const getQuotationConversionApi = (params = {}) =>
  axiosClient.get("/reports/quotation-conversion", { params }).then((res) => res.data.data);

// Generic export — /reports-export/:reportName?format=csv|excel|pdf plus
// whatever filters that report's GET endpoint accepts (respected server-side).
export const exportReportApi = (reportName, format, params = {}) =>
  axiosClient
    .get(`/reports-export/${reportName}`, {
      params: { ...params, format },
      responseType: "blob",
    })
    .then((res) => {
      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      return { blob: res.data, filename: match?.[1] ?? `${reportName}.${format}` };
    });
