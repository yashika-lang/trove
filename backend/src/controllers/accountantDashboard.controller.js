import accountantDashboardService
  from "../services/accountantDashboard.service.js";


// ==========================================
// ROLE CHECK
// ==========================================

const checkAccountantAccess = (req) => {

  if (!req.user) {
    return false;
  }

  const role =
    String(req.user.role || "")
      .toLowerCase();

  return (
    role === "accountant" ||
    role === "admin"
  );
};


// ==========================================
// SUMMARY
// ==========================================

const getAccountantDashboardSummary =
  async (req, res, next) => {

    try {

      if (!checkAccountantAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }


      const data =
        await accountantDashboardService
          .getSummary(req.user);


      return res.status(200).json({
        success: true,

        message:
          "Accountant dashboard summary fetched successfully.",

        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// REVENUE TREND
// ==========================================

const getAccountantRevenueTrend =
  async (req, res, next) => {

    try {

      if (!checkAccountantAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }


      const data =
        await accountantDashboardService
          .getRevenueTrend(
            req.user
          );


      return res.status(200).json({
        success: true,

        message:
          "Revenue trend fetched successfully.",

        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// PAYMENT DISTRIBUTION
// ==========================================

const getAccountantPaymentDistribution =
  async (req, res, next) => {

    try {

      if (!checkAccountantAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }


      const data =
        await accountantDashboardService
          .getPaymentDistribution(
            req.user
          );


      return res.status(200).json({
        success: true,

        message:
          "Payment distribution fetched successfully.",

        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// TOP PRODUCTS
// ==========================================

const getAccountantTopProducts =
  async (req, res, next) => {

    try {

      if (!checkAccountantAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }


      const data =
        await accountantDashboardService
          .getTopProducts(
            req.user
          );


      return res.status(200).json({
        success: true,

        message:
          "Top products fetched successfully.",

        data,
      });

    } catch (error) {
      next(error);
    }
  };


// ==========================================
// RECENT ACTIVITY
// ==========================================

const getAccountantRecentActivity =
  async (req, res, next) => {

    try {

      if (!checkAccountantAccess(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }


      const data =
        await accountantDashboardService
          .getRecentActivity(
            req.user
          );


      return res.status(200).json({
        success: true,

        message:
          "Recent activity fetched successfully.",

        data,
      });

    } catch (error) {
      next(error);
    }
  };


export {
  getAccountantDashboardSummary,
  getAccountantRevenueTrend,
  getAccountantPaymentDistribution,
  getAccountantTopProducts,
  getAccountantRecentActivity,
};