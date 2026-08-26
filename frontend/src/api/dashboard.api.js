import axiosClient from "./axiosClient";

// Maps 1:1 to backend/src/routes/dashboard.routes.js (Admin + Accountant).
export const getDashboardApi = () =>
  axiosClient.get("/dashboard").then((res) => res.data.data);
