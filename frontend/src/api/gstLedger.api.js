import axiosClient from "./axiosClient";

// Maps to backend/src/routes/gstLedger.routes.js (Admin + Accountant view/
// create; Admin-only delete). GET / includes both auto-generated invoice GST
// entries (OUTPUT_CGST/SGST/IGST) and manually created entries — only
// INPUT_CGST/INPUT_SGST/INPUT_IGST/GST_PAYMENT can be created manually.
export const getGstLedgerApi = ({ type, search, customer, startDate, endDate, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/gst-ledger", { params: { type, search, customer, startDate, endDate, page, limit } })
    .then((res) => res.data.data);

export const createGstLedgerEntryApi = (payload) =>
  axiosClient.post("/gst-ledger/entries", payload).then((res) => res.data.data);

export const deleteGstLedgerEntryApi = (entryId) =>
  axiosClient.delete(`/gst-ledger/entries/${entryId}`).then((res) => res.data.data);

export const exportGstLedgerApi = ({ type, search, customer, startDate, endDate } = {}) =>
  axiosClient
    .get("/gst-ledger/export", { params: { type, search, customer, startDate, endDate }, responseType: "blob" })
    .then((res) => res.data);
