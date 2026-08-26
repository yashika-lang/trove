import axiosClient from "./axiosClient";

// One file for the whole GST module — each section maps to its own
// backend/src/routes/gst*.routes.js (all Admin + Accountant, Admin-only
// for delete where applicable).

// ---------- GST Dashboard ----------
export const getGSTDashboardApi = () =>
  axiosClient.get("/gst-dashboard").then((res) => res.data.data);

// ---------- GST Transactions ----------
export const getGSTTransactionsApi = (params = {}) =>
  axiosClient.get("/gst-transactions", { params }).then((res) => res.data.data);

export const getGSTTransactionByIdApi = (id) =>
  axiosClient.get(`/gst-transactions/${id}`).then((res) => res.data.data);

export const createGSTTransactionApi = (payload) =>
  axiosClient.post("/gst-transactions", payload).then((res) => res.data.data);

export const updateGSTTransactionApi = (id, payload) =>
  axiosClient.patch(`/gst-transactions/${id}`, payload).then((res) => res.data.data);

export const deleteGSTTransactionApi = (id) =>
  axiosClient.delete(`/gst-transactions/${id}`).then((res) => res.data.data);

// ---------- HSN/SAC Master ----------
export const getHsnSacApi = (params = {}) =>
  axiosClient.get("/hsn-sac", { params }).then((res) => res.data.data);

export const createHsnSacApi = (payload) =>
  axiosClient.post("/hsn-sac", payload).then((res) => res.data.data);

export const updateHsnSacApi = (id, payload) =>
  axiosClient.patch(`/hsn-sac/${id}`, payload).then((res) => res.data.data);

export const deleteHsnSacApi = (id) =>
  axiosClient.delete(`/hsn-sac/${id}`).then((res) => res.data.data);

// ---------- Tax Rates ----------
export const getTaxRatesApi = () =>
  axiosClient.get("/tax-rates").then((res) => res.data.data);

export const createTaxRateApi = (payload) =>
  axiosClient.post("/tax-rates", payload).then((res) => res.data.data);

export const updateTaxRateApi = (id, payload) =>
  axiosClient.patch(`/tax-rates/${id}`, payload).then((res) => res.data.data);

export const deleteTaxRateApi = (id) =>
  axiosClient.delete(`/tax-rates/${id}`).then((res) => res.data.data);

// ---------- ITC ----------
export const getITCEntriesApi = (params = {}) =>
  axiosClient.get("/itc", { params }).then((res) => res.data.data);

export const getITCSummaryApi = () =>
  axiosClient.get("/itc/summary").then((res) => res.data.data);

export const createITCEntryApi = (payload) =>
  axiosClient.post("/itc", payload).then((res) => res.data.data);

export const claimITCApi = (id, amount) =>
  axiosClient.patch(`/itc/${id}/claim`, { amount }).then((res) => res.data.data);

export const reverseITCApi = (id, amount) =>
  axiosClient.patch(`/itc/${id}/reverse`, { amount }).then((res) => res.data.data);

// ---------- Reconciliation (GSTR-2B vs Books records) ----------
export const getReconciliationRecordsApi = (params = {}) =>
  axiosClient.get("/gst-reconciliation", { params }).then((res) => res.data.data);

export const getReconciliationRecordStatsApi = (params = {}) =>
  axiosClient.get("/gst-reconciliation/record-stats", { params }).then((res) => res.data.data);

export const createReconciliationRecordApi = (payload) =>
  axiosClient.post("/gst-reconciliation", payload).then((res) => res.data.data);

export const rerunReconciliationMatchApi = (period) =>
  axiosClient.post("/gst-reconciliation/rerun-match", { period }).then((res) => res.data.data);

// ---------- Return Preparation ----------
export const getGSTReturnsApi = (params = {}) =>
  axiosClient.get("/gst-returns", { params }).then((res) => res.data.data);

export const getGSTReturnStatsApi = () =>
  axiosClient.get("/gst-returns/stats").then((res) => res.data.data);

export const createGSTReturnApi = (payload) =>
  axiosClient.post("/gst-returns", payload).then((res) => res.data.data);

export const updateGSTReturnApi = (id, payload) =>
  axiosClient.patch(`/gst-returns/${id}`, payload).then((res) => res.data.data);

// ---------- Validation Center ----------
export const getGSTValidationApi = () =>
  axiosClient.get("/gst-validation").then((res) => res.data.data);

// ---------- GST Settings ----------
export const getGSTSettingsApi = () =>
  axiosClient.get("/gst-settings").then((res) => res.data.data);

export const saveGSTSettingsApi = (payload) =>
  axiosClient.put("/gst-settings", payload).then((res) => res.data.data);

// ---------- Audit Log ----------
export const getGSTAuditLogsApi = (params = {}) =>
  axiosClient.get("/gst-audit-logs", { params }).then((res) => res.data.data);
