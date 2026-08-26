import axiosClient from "./axiosClient";

// Maps to backend/src/routes/reconciliation.routes.js (Admin + Accountant).
// This is the real reconciliation workflow: it links a bank CREDIT
// transaction to an actual PAID customer Payment record (amount must match
// exactly, and a payment can only be linked once) — not a bare status flag.
export const getReconciliationTransactionsApi = ({
  bankAccount,
  type,
  reconciliationStatus,
  search,
  startDate,
  endDate,
  page = 1,
  limit = 10,
} = {}) =>
  axiosClient
    .get("/reconciliation", {
      params: { bankAccount, type, reconciliationStatus, search, startDate, endDate, page, limit },
    })
    .then((res) => res.data.data);

export const getReconciliationStatsApi = () =>
  axiosClient.get("/reconciliation/stats").then((res) => res.data.data);

export const findPaymentMatchesApi = (transactionId) =>
  axiosClient.get(`/reconciliation/${transactionId}/matches`).then((res) => res.data.data);

export const autoReconcileTransactionApi = (transactionId) =>
  axiosClient.post(`/reconciliation/${transactionId}/auto-reconcile`).then((res) => res.data.data);

export const reconcileTransactionApi = (transactionId, paymentId) =>
  axiosClient.patch(`/reconciliation/${transactionId}`, { paymentId }).then((res) => res.data.data);
