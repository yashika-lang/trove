import axiosClient from "./axiosClient";

// Maps to backend/src/routes/ledger.routes.js. Company-wide ledger (the main
// Customer Ledger tab) is Admin + Accountant only; the per-customer endpoint
// additionally allows Sales.
export const getCompanyLedgerApi = ({ customer, type, search, startDate, endDate, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/ledger", { params: { customer, type, search, startDate, endDate, page, limit } })
    .then((res) => res.data.data);

export const getCustomerLedgerApi = (customerId, { type, search, startDate, endDate, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get(`/ledger/customer/${customerId}`, { params: { type, search, startDate, endDate, page, limit } })
    .then((res) => res.data.data);

export const exportCompanyLedgerApi = ({ customer, type, search, startDate, endDate } = {}) =>
  axiosClient
    .get("/ledger/export", { params: { customer, type, search, startDate, endDate }, responseType: "blob" })
    .then((res) => res.data);

export const exportCustomerLedgerApi = (customerId, { type, search, startDate, endDate } = {}) =>
  axiosClient
    .get(`/ledger/customer/${customerId}/export`, {
      params: { type, search, startDate, endDate },
      responseType: "blob",
    })
    .then((res) => res.data);
