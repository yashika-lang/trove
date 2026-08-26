import axiosClient from "./axiosClient";

// Maps to backend/src/routes/bank.routes.js (Admin + Accountant view/create/update; Admin-only delete).
export const getBanksApi = ({ status, accountType } = {}) =>
  axiosClient.get("/banks", { params: { status, accountType } }).then((res) => res.data.data);

export const getBankStatsApi = () =>
  axiosClient.get("/banks/stats").then((res) => res.data.data);

export const getBankByIdApi = (bankId) =>
  axiosClient.get(`/banks/${bankId}`).then((res) => res.data.data);

export const createBankApi = (payload) =>
  axiosClient.post("/banks", payload).then((res) => res.data.data);

export const updateBankApi = (bankId, payload) =>
  axiosClient.patch(`/banks/${bankId}`, payload).then((res) => res.data.data);

export const deleteBankApi = (bankId) =>
  axiosClient.delete(`/banks/${bankId}`).then((res) => res.data.data);
