import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import DashboardService from "../services/dashboard.service.js";

const dashboardService =
  new DashboardService();

// ==========================================
// COMPLETE DASHBOARD
// ==========================================

const getDashboardController =
  asyncHandler(async (req, res) => {
    const result =
      await dashboardService.getDashboard(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Dashboard fetched successfully."
      )
    );
  });

// ==========================================
// SUMMARY
// ==========================================

const getDashboardSummaryController =
  asyncHandler(async (req, res) => {
    const result =
      await dashboardService.getSummary(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Dashboard summary fetched successfully."
      )
    );
  });

// ==========================================
// REVENUE TREND
// ==========================================

const getRevenueTrendController =
  asyncHandler(async (req, res) => {
    const result =
      await dashboardService.getRevenueTrend(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Revenue trend fetched successfully."
      )
    );
  });

// ==========================================
// PAYMENT DISTRIBUTION
// ==========================================

const getPaymentDistributionController =
  asyncHandler(async (req, res) => {
    const result =
      await dashboardService.getPaymentDistribution(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Payment distribution fetched successfully."
      )
    );
  });

// ==========================================
// TOP PRODUCTS
// ==========================================

const getTopProductsController =
  asyncHandler(async (req, res) => {
    const {
      limit,
    } = req.query;

    const result =
      await dashboardService.getTopProducts(
        req.user,
        limit
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Top products fetched successfully."
      )
    );
  });

// ==========================================
// RECENT ACTIVITY
// ==========================================

const getRecentActivityController =
  asyncHandler(async (req, res) => {
    const {
      limit,
    } = req.query;

    const result =
      await dashboardService.getRecentActivity(
        req.user,
        limit
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Recent activity fetched successfully."
      )
    );
  });

export {
  getDashboardController,
  getDashboardSummaryController,
  getRevenueTrendController,
  getPaymentDistributionController,
  getTopProductsController,
  getRecentActivityController,
};