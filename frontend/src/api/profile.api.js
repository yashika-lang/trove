import axiosClient from "./axiosClient";

// Maps to backend/src/routes/profile.routes.js (Admin + Sales + Accountant).
export const getMyProfileApi = () =>
  axiosClient.get("/profile").then((res) => res.data.data);

export const updateMyProfileApi = (payload) =>
  axiosClient.patch("/profile", payload).then((res) => res.data.data);

export const updateMyPreferencesApi = (payload) =>
  axiosClient.patch("/profile/preferences", payload).then((res) => res.data.data);
