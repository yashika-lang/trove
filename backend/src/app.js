import express from "express"; 
import cors from "cors";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

/*import authRoutes from "./routes/auth.routes.js"; */

import { notFound } from "./middleware/notFound.middleware.js";
import globalErrorHandler from "./exceptions/globalErrorHandler.js";

const app = express(); // it returns an instance of express application say : get , post put , delete etc 

// CORS
app.use( // middleware to handle cross- origin requests 
  cors({ 
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json()); // it converts the incoming request body to json format and makes it available in req.body

app.use(express.urlencoded({ extended: true })); // it parses the incoming request body with URL-encoded format

// Cookies
app.use(cookieParser()); // it parses the cookies attached to the client request object and makes them available in req.cookies

// Static Files
app.use(express.static("public")); // it serves static files from the "public" directory, allowing access to files like images, CSS, and JavaScript in that directory

// Routes
/* app.use("/api/v1/auth", authRoutes); */

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes); // it mounts the authRoutes router on the "/api/v1/auth" path, so any requests to that path will be handled by the authRoutes router


// 404 Middleware
app.use(notFound); 
// Global Error Handler
app.use(globalErrorHandler);

export default app; 
