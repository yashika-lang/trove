import axiosClient from "./axiosClient";

// Maps to backend/src/routes/bankTransaction.routes.js (Admin + Accountant
// view/create/update; Admin-only delete). Reconciliation is intentionally
// NOT exposed here — the real, payment-linked reconcile workflow lives in
// reconciliation.api.js (see backend/src/services/reconciliation.service.js);
// this module's own `/reconcile` endpoint is a raw status toggle with no
// payment link and would show fake "reconciled" data if used.
export const getBankTransactionsApi = ({
  bankAccount,
  type,
  reconciliationStatus,
  search,
  page = 1,
  limit = 10,
} = {}) =>
  axiosClient
    .get("/bank-transactions", { params: { bankAccount, type, reconciliationStatus, search, page, limit } })
    .then((res) => res.data.data);

export const getBankTransactionByIdApi = (transactionId) =>
  axiosClient.get(`/bank-transactions/${transactionId}`).then((res) => res.data.data);

export const createBankTransactionApi = (payload) =>
  axiosClient.post("/bank-transactions", payload).then((res) => res.data.data);

export const deleteBankTransactionApi = (transactionId) =>
  axiosClient.delete(`/bank-transactions/${transactionId}`).then((res) => res.data.data);

export const getBankTransactionStatsApi = () =>
  axiosClient.get("/bank-transactions/stats").then((res) => res.data.data);

export const exportBankTransactionsApi = ({ bankAccount, type, reconciliationStatus, search } = {}) =>
  axiosClient
    .get("/bank-transactions/export", {
      params: { bankAccount, type, reconciliationStatus, search },
      responseType: "blob",
    })
    .then((res) => res.data);
