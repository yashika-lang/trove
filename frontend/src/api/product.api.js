import axiosClient from "./axiosClient";

// Maps to backend/src/routes/product.routes.js
// View: Admin + Sales. Create/Update/Delete/Stats: Admin only.

// Flat product array — used by dropdowns (quotation/invoice/credit-note
// line-item pickers) that only need {_id, productName, price, gst, hsnCode}.
export const getProductsApi = ({ search, page = 1, limit = 100 } = {}) =>
  axiosClient
    .get("/products", { params: { search, page, limit } })
    .then((res) => res.data.data.products ?? []);

// Full paginated result — used by the Products listing page.
export const getProductsListApi = ({ search, category, status, page = 1, limit = 10 } = {}) =>
  axiosClient
    .get("/products", { params: { search, category, status, page, limit } })
    .then((res) => res.data.data);

export const getProductStatsApi = () =>
  axiosClient.get("/products/stats").then((res) => res.data.data);

export const getProductByIdApi = (productId) =>
  axiosClient.get(`/products/${productId}`).then((res) => res.data.data);

export const createProductApi = (payload) =>
  axiosClient.post("/products", payload).then((res) => res.data.data);

export const updateProductApi = (productId, payload) =>
  axiosClient.patch(`/products/${productId}`, payload).then((res) => res.data.data);

export const deleteProductApi = (productId) =>
  axiosClient.delete(`/products/${productId}`).then((res) => res.data.data);
