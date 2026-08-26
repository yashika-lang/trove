import axiosClient from "./axiosClient";

export const createCreditDebitNoteApi = (payload) =>
  axiosClient.post("/credit-debit-notes", payload).then((res) => res.data.data);

export const getCreditDebitNotesApi = ({ invoice, type } = {}) =>
  axiosClient
    .get("/credit-debit-notes", { params: { invoice, type } })
    .then((res) => res.data.data);
