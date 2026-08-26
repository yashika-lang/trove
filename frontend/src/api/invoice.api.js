import axiosClient from "./axiosClient";

// Maps 1:1 to backend/src/routes/invoice.routes.js
export const getInvoiceStatsApi = () =>
  axiosClient.get("/invoices/stats").then((res) => res.data.data);

export const getInvoicesApi = ({ search, status, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/invoices", { params: { search, status, page, limit } })
    .then((res) => res.data.data);

export const getInvoiceByIdApi = (invoiceId) =>
  axiosClient.get(`/invoices/${invoiceId}`).then((res) => res.data.data);

export const createInvoiceApi = (payload) =>
  axiosClient.post("/invoices", payload).then((res) => res.data.data);

export const createInvoiceFromQuotationApi = (quotationId, dueDate) =>
  axiosClient
    .post(`/invoices/from-quotation/${quotationId}`, { dueDate })
    .then((res) => res.data.data);

export const updateInvoiceStatusApi = (invoiceId, status) =>
  axiosClient
    .patch(`/invoices/${invoiceId}/status`, { status })
    .then((res) => res.data.data);

export const deleteInvoiceApi = (invoiceId) =>
  axiosClient.delete(`/invoices/${invoiceId}`).then((res) => res.data.data);

export const downloadInvoicePdfApi = (invoiceId) =>
  axiosClient
    .get(`/invoices/${invoiceId}/pdf`, { responseType: "blob" })
    .then((res) => res.data);

export const emailInvoiceApi = (invoiceId, to) =>
  axiosClient
    .post(`/invoices/${invoiceId}/email`, to ? { to } : {})
    .then((res) => res.data.data);
