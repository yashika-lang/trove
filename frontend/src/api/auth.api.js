import axiosClient from "./axiosClient";

// Maps 1:1 to backend/src/routes/auth.routes.js

export const registerApi = (payload) =>
  axiosClient.post("/auth/register", payload).then((res) => res.data.data);

export const loginApi = ({ email, password }) =>
  axiosClient
    .post("/auth/login", { email, password })
    .then((res) => res.data.data);

export const logoutApi = () =>
  axiosClient.post("/auth/logout").then((res) => res.data.data);

export const getCurrentUserApi = () =>
  axiosClient.get("/auth/current-user").then((res) => res.data.data);

export const changePasswordApi = ({ oldPassword, newPassword }) =>
  axiosClient
    .post("/auth/change-password", { oldPassword, newPassword })
    .then((res) => res.data.data);
