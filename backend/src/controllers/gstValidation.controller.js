import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import { runValidation } from "../services/gstValidation.service.js";

const getGSTValidationController = asyncHandler(async (req, res) => {
  const result = await runValidation(req.user);

  return res.status(200).json(
    new ApiResponse(200, result, "GST validation completed successfully.")
  );
});

export { getGSTValidationController };
