import axiosClient from "./axiosClient";

// Maps to backend/src/routes/cashLedger.routes.js (Admin + Accountant
// view/create/update; Admin-only delete).
export const getCashLedgerApi = ({ type, search, startDate, endDate, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/cash-ledger", { params: { type, search, startDate, endDate, page, limit } })
    .then((res) => res.data.data);

export const getCashLedgerStatsApi = () =>
  axiosClient.get("/cash-ledger/stats").then((res) => res.data.data);

export const createCashLedgerEntryApi = (payload) =>
  axiosClient.post("/cash-ledger", payload).then((res) => res.data.data);

export const deleteCashLedgerEntryApi = (entryId) =>
  axiosClient.delete(`/cash-ledger/${entryId}`).then((res) => res.data.data);

export const exportCashLedgerApi = ({ type, search, startDate, endDate } = {}) =>
  axiosClient
    .get("/cash-ledger/export", { params: { type, search, startDate, endDate }, responseType: "blob" })
    .then((res) => res.data);
