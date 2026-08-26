import axiosClient from "./axiosClient";

// Maps to backend/src/routes/payment.routes.js (Admin + Sales + Accountant view/create; Admin-only delete).
export const getPaymentsApi = ({ search, paymentMode, status, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/payments", { params: { search, paymentMode, status, page, limit } })
    .then((res) => res.data.data);

export const getPaymentStatsApi = () =>
  axiosClient.get("/payments/stats").then((res) => res.data.data);

export const getPaymentByIdApi = (paymentId) =>
  axiosClient.get(`/payments/${paymentId}`).then((res) => res.data.data);

export const createPaymentApi = (payload) =>
  axiosClient.post("/payments", payload).then((res) => res.data.data);

export const updatePaymentStatusApi = (paymentId, status) =>
  axiosClient.patch(`/payments/${paymentId}/status`, { status }).then((res) => res.data.data);

export const downloadPaymentReceiptPdfApi = (paymentId) =>
  axiosClient
    .get(`/payments/${paymentId}/pdf`, { responseType: "blob" })
    .then((res) => res.data);

export const emailPaymentReceiptApi = (paymentId, to) =>
  axiosClient
    .post(`/payments/${paymentId}/email`, to ? { to } : {})
    .then((res) => res.data.data);
