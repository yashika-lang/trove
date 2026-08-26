import axiosClient from "./axiosClient";

export const getNotificationsApi = (params = {}) =>
  axiosClient.get("/notifications", { params }).then((res) => res.data.data);

export const markNotificationReadApi = (id) =>
  axiosClient.patch(`/notifications/${id}/read`).then((res) => res.data.data);

export const markAllNotificationsReadApi = () =>
  axiosClient.patch("/notifications/read-all").then((res) => res.data.data);
