import axiosClient from "./axiosClient";

// Maps 1:1 to backend/src/routes/settings.routes.js (all Admin-only).

export const getAllSettingsApi = () =>
  axiosClient.get("/settings").then((res) => res.data.data);

export const updateGeneralSettingsApi = (payload) =>
  axiosClient.patch("/settings/general", payload).then((res) => res.data.data);

export const updateCompanyInfoApi = (payload) =>
  axiosClient.patch("/settings/company-info", payload).then((res) => res.data.data);

export const updateInvoiceQuotationApi = (payload) =>
  axiosClient.patch("/settings/invoice-quotation", payload).then((res) => res.data.data);

export const updateGstTaxApi = (payload) =>
  axiosClient.patch("/settings/gst-tax", payload).then((res) => res.data.data);

export const updatePaymentPreferencesApi = (payload) =>
  axiosClient.patch("/settings/payment-preferences", payload).then((res) => res.data.data);

export const updateNotificationSettingsApi = (payload) =>
  axiosClient.patch("/settings/notifications", payload).then((res) => res.data.data);

export const updateSecurityPolicyApi = (payload) =>
  axiosClient.patch("/settings/security", payload).then((res) => res.data.data);

// ---------- Bank Accounts ----------
export const getBankAccountsApi = () =>
  axiosClient.get("/settings/bank-accounts").then((res) => res.data.data);

export const createBankAccountApi = (payload) =>
  axiosClient.post("/settings/bank-accounts", payload).then((res) => res.data.data);

export const updateBankAccountApi = (id, payload) =>
  axiosClient.patch(`/settings/bank-accounts/${id}`, payload).then((res) => res.data.data);

export const deleteBankAccountApi = (id) =>
  axiosClient.delete(`/settings/bank-accounts/${id}`).then((res) => res.data.data);

export const setDefaultBankAccountApi = (id) =>
  axiosClient.patch(`/settings/bank-accounts/${id}/default`).then((res) => res.data.data);

// ---------- Document Templates ----------
export const getDocumentTemplatesApi = (type) =>
  axiosClient.get("/settings/document-templates", { params: type ? { type } : {} }).then((res) => res.data.data);

export const createDocumentTemplateApi = (payload) =>
  axiosClient.post("/settings/document-templates", payload).then((res) => res.data.data);

export const updateDocumentTemplateApi = (id, payload) =>
  axiosClient.patch(`/settings/document-templates/${id}`, payload).then((res) => res.data.data);

export const deleteDocumentTemplateApi = (id) =>
  axiosClient.delete(`/settings/document-templates/${id}`).then((res) => res.data.data);

export const setDefaultDocumentTemplateApi = (id) =>
  axiosClient.patch(`/settings/document-templates/${id}/default`).then((res) => res.data.data);
