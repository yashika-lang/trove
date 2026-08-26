import axiosClient from "./axiosClient";

// Maps to backend/src/routes/bankDashboard.routes.js (Admin + Accountant).
// Single source of truth for balances, stats and the transactions table —
// all figures are backend-computed (see bankDashboard.repository.js), never
// recalculated on the frontend.
export const getBankDashboardApi = ({
  startDate,
  endDate,
  bankAccount,
  type,
  reconciliationStatus,
  search,
  page = 1,
  limit = 10,
} = {}) =>
  axiosClient
    .get("/bank-dashboard", {
      params: { startDate, endDate, bankAccount, type, reconciliationStatus, search, page, limit },
    })
    .then((res) => res.data.data);
