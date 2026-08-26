import axiosClient from "./axiosClient";

// Maps to backend/src/routes/accountantDashboard.routes.js (Admin + Accountant).
export const getAccountantSummaryApi = () =>
  axiosClient.get("/accountant-dashboard/summary").then((res) => res.data.data);

export const getAccountantRevenueTrendApi = () =>
  axiosClient.get("/accountant-dashboard/revenue-trend").then((res) => res.data.data);

export const getAccountantPaymentDistributionApi = () =>
  axiosClient.get("/accountant-dashboard/payment-distribution").then((res) => res.data.data);

export const getAccountantTopProductsApi = () =>
  axiosClient.get("/accountant-dashboard/top-products").then((res) => res.data.data);

export const getAccountantRecentActivityApi = () =>
  axiosClient.get("/accountant-dashboard/recent-activity").then((res) => res.data.data);
