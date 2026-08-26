import axiosClient from "./axiosClient";

// Maps to backend/src/routes/salesDashboard.routes.js (Admin + Sales).
export const getSalesSummaryApi = () =>
  axiosClient.get("/sales-dashboard/summary").then((res) => res.data.data);

export const getSalesMonthlyPerformanceApi = () =>
  axiosClient.get("/sales-dashboard/monthly-performance").then((res) => res.data.data);

export const getSalesFollowUpsApi = () =>
  axiosClient.get("/sales-dashboard/follow-ups").then((res) => res.data.data);

export const getSalesRecentCustomersApi = () =>
  axiosClient.get("/sales-dashboard/recent-customers").then((res) => res.data.data);

export const getSalesActivityApi = () =>
  axiosClient.get("/sales-dashboard/activity").then((res) => res.data.data);
