import salesDashboardService
  from "../services/salesDashboard.service.js";


// ==========================================
// ROLE CHECK
// ==========================================

const checkSalesAccess = (req) => {
  if (!req.user) {
    return false;
  }

  const role =
    String(req.user.role || "")
      .toLowerCase();

  return (
    role === "sales" ||
    role === "admin"
  );
};


// ==========================================
// SUMMARY
// ==========================================

const getSalesDashboardSummary =
  async (req, res, next) => {
    try {

      if (!checkSalesAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }

      const data =
        await salesDashboardService
          .getSummary(req.user);

      return res.status(200).json({
        success: true,
        message:
          "Sales dashboard summary fetched successfully.",
        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// MONTHLY PERFORMANCE
// ==========================================

const getSalesMonthlyPerformance =
  async (req, res, next) => {
    try {

      if (!checkSalesAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }

      const data =
        await salesDashboardService
          .getMonthlyPerformance(
            req.user
          );

      return res.status(200).json({
        success: true,
        message:
          "Monthly sales performance fetched successfully.",
        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// FOLLOW UPS
// ==========================================

const getSalesFollowUps =
  async (req, res, next) => {
    try {

      if (!checkSalesAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }

      const data =
        await salesDashboardService
          .getFollowUps(req.user);

      return res.status(200).json({
        success: true,
        message:
          "Sales follow-ups fetched successfully.",
        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// RECENT CUSTOMERS
// ==========================================

const getSalesRecentCustomers =
  async (req, res, next) => {
    try {

      if (!checkSalesAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }

      const data =
        await salesDashboardService
          .getRecentCustomers(
            req.user
          );

      return res.status(200).json({
        success: true,
        message:
          "Recent customers fetched successfully.",
        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// ACTIVITY
// ==========================================

const getSalesActivity =
  async (req, res, next) => {
    try {

      if (!checkSalesAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }

      const data =
        await salesDashboardService
          .getActivity(req.user);

      return res.status(200).json({
        success: true,
        message:
          "Sales activity fetched successfully.",
        data,
      });

    } catch (error) {
      next(error);
    }
  };


export {
  getSalesDashboardSummary,
  getSalesMonthlyPerformance,
  getSalesFollowUps,
  getSalesRecentCustomers,
  getSalesActivity,
};