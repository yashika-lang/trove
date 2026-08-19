import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  getBankDashboardService,
} from "../services/bankDashboard.service.js";


// ==========================================
// GET BANK DASHBOARD
// ==========================================

const getBankDashboard = asyncHandler(
  async (req, res) => {

    const {
      startDate,
      endDate,
      bankAccount,
      type,
      reconciliationStatus,
      search,
      page,
      limit,
    } = req.query;


    const result =
      await getBankDashboardService(
        req.user,
        {
          startDate,
          endDate,
          bankAccount,
          type,
          reconciliationStatus,
          search,
          page,
          limit,
        }
      );


    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Bank dashboard fetched successfully."
      )
    );
  }
);


export {
  getBankDashboard,
};