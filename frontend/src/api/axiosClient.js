import axios from "axios";

// Matches the backend's ApiResponse/ApiError envelope exactly:
// { statusCode, data, message, success } (see
// backend/src/exceptions/ApiResponse.js and ApiError.js).
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true, // send/receive the httpOnly accessToken/refreshToken cookies
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
