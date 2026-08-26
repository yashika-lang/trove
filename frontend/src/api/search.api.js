import axiosClient from "./axiosClient";

export const globalSearchApi = (q) =>
  axiosClient.get("/search", { params: { q } }).then((res) => res.data.data);
