import axiosClient from "./axiosClient";

// Maps to backend/src/routes/customer.routes.js (Admin + Sales).
// Unlike /products, this endpoint returns the customer array directly (no
// { customers, pagination } wrapper) — backend/src/services/customer.service.js
// getAllCustomers returns the repository's array as-is. There is no
// backend-side pagination total, so the Customers listing page paginates
// client-side over this same flat array.
export const getCustomersApi = ({ search, status, page = 1, limit = 100 } = {}) =>
  axiosClient
    .get("/customers", { params: { search, status, page, limit } })
    .then((res) => res.data.data ?? []);

export const getCustomerStatsApi = () =>
  axiosClient.get("/customers/stats").then((res) => res.data.data);

export const getCustomerByIdApi = (customerId) =>
  axiosClient.get(`/customers/${customerId}`).then((res) => res.data.data);

export const createCustomerApi = (payload) =>
  axiosClient.post("/customers", payload).then((res) => res.data.data);

export const updateCustomerApi = (customerId, payload) =>
  axiosClient.patch(`/customers/${customerId}`, payload).then((res) => res.data.data);
