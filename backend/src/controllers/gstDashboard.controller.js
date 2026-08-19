import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  getGSTDashboard,
} from "../services/gstDashboard.service.js";


// ==========================================
// GST DASHBOARD
// Admin + Accountant
// ==========================================

const getGSTDashboardController =
  asyncHandler(async (req, res) => {

    const result =
      await getGSTDashboard(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST dashboard fetched successfully."
      )
    );
  });


export {
  getGSTDashboardController,
};