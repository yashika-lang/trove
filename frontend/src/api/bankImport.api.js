import axiosClient from "./axiosClient";

// Maps to backend/src/routes/bankImport.routes.js (Admin + Accountant).
// The backend validates and imports the whole CSV as a single all-or-nothing
// transaction (any invalid row rejects the entire file with a row-numbered
// error) — there is no per-row partial-success API, so the frontend must not
// invent one.
export const importBankStatementApi = (file, bankAccountId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bankAccount", bankAccountId);

  return axiosClient
    .post("/bank-import", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data.data);
};
