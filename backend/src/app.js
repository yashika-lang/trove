import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";

/*import authRoutes from "./routes/auth.routes.js"; */

import { notFound } from "./middleware/notFound.middleware.js";
import globalErrorHandler from "./exceptions/globalErrorHandler.js";

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Static Files
app.use(express.static("public"));

// Routes
/* app.use("/api/v1/auth", authRoutes); */
app.use("/api/v1/health", healthRoutes);

// 404 Middleware
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

export default app;