import { Router } from "express";
import ApiResponse from "../exceptions/ApiResponse.js";

const router = Router();

router.get("/", (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Server is running"));
});

export default router;