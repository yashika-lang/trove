import axiosClient from "./axiosClient";

// Maps 1:1 to backend/src/routes/quotation.routes.js (Admin + Sales).
export const getQuotationStatsApi = () =>
  axiosClient.get("/quotations/stats").then((res) => res.data.data);

export const getQuotationsApi = ({ search, status, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/quotations", { params: { search, status, page, limit } })
    .then((res) => res.data.data);

export const getQuotationByIdApi = (quotationId) =>
  axiosClient.get(`/quotations/${quotationId}`).then((res) => res.data.data);

export const createQuotationApi = (payload) =>
  axiosClient.post("/quotations", payload).then((res) => res.data.data);

export const updateQuotationStatusApi = (quotationId, status) =>
  axiosClient
    .patch(`/quotations/${quotationId}/status`, { status })
    .then((res) => res.data.data);

export const deleteQuotationApi = (quotationId) =>
  axiosClient.delete(`/quotations/${quotationId}`).then((res) => res.data.data);

export const downloadQuotationPdfApi = (quotationId) =>
  axiosClient
    .get(`/quotations/${quotationId}/pdf`, { responseType: "blob" })
    .then((res) => res.data);

export const emailQuotationApi = (quotationId, to) =>
  axiosClient
    .post(`/quotations/${quotationId}/email`, to ? { to } : {})
    .then((res) => res.data.data);

// backend/src/routes/invoice.routes.js — POST /from-quotation/:quotationId
export const convertQuotationToInvoiceApi = (quotationId, dueDate) =>
  axiosClient
    .post(`/invoices/from-quotation/${quotationId}`, { dueDate })
    .then((res) => res.data.data);
