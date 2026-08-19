import asyncHandler from "../exceptions/asyncHandler.js";

import {
  getDailySales as getDailySalesService,
  getMonthlySales as getMonthlySalesService,
  getQuotationReport as getQuotationReportService,

  getGSTReport as getGSTReportService,
  getOutstandingReport as getOutstandingReportService,
  getLedgerReport as getLedgerReportService,
  getBankSummary as getBankSummaryService,
  getPaymentReport as getPaymentReportService,

  getTopCustomers as getTopCustomersService,
  getTopProducts as getTopProductsService,
  getQuotationConversion as getQuotationConversionService,
} from "../services/report.service.js";


// ======================================================
// DAILY SALES
// ======================================================

const getDailySales = asyncHandler(
  async (req, res) => {

    const data =
      await getDailySalesService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,

          search:
            req.query.search,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Daily sales report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// MONTHLY SALES
// ======================================================

const getMonthlySales = asyncHandler(
  async (req, res) => {

    const data =
      await getMonthlySalesService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Monthly sales report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// QUOTATION REPORT
// ======================================================

const getQuotationReport = asyncHandler(
  async (req, res) => {

    const data =
      await getQuotationReportService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,

          search:
            req.query.search,

          status:
            req.query.status,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Quotation report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// GST REPORT
// ======================================================

const getGSTReport = asyncHandler(
  async (req, res) => {

    const data =
      await getGSTReportService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,

          search:
            req.query.search,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "GST report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// OUTSTANDING REPORT
// ======================================================

const getOutstandingReport = asyncHandler(
  async (req, res) => {

    const data =
      await getOutstandingReportService(
        req.user
      );


    return res.status(200).json({

      success: true,

      message:
        "Outstanding report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// LEDGER REPORT
// ======================================================

const getLedgerReport = asyncHandler(
  async (req, res) => {

    const data =
      await getLedgerReportService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,

          search:
            req.query.search,

          type:
            req.query.type,

          page:
            req.query.page,

          limit:
            req.query.limit,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Ledger report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// BANK SUMMARY
// ======================================================

const getBankSummary = asyncHandler(
  async (req, res) => {

    const data =
      await getBankSummaryService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,

          search:
            req.query.search,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Bank summary report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// PAYMENT REPORT
// ======================================================

const getPaymentReport = asyncHandler(
  async (req, res) => {

    const data =
      await getPaymentReportService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,

          search:
            req.query.search,

          status:
            req.query.status,

          mode:
            req.query.mode,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Payment report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// TOP CUSTOMERS
// ======================================================

const getTopCustomers = asyncHandler(
  async (req, res) => {

    const data =
      await getTopCustomersService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Top customers report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// TOP PRODUCTS
// ======================================================

const getTopProducts = asyncHandler(
  async (req, res) => {

    const data =
      await getTopProductsService(
        req.user,
        {
          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Top products report fetched successfully.",

      data,

    });
  }
);


// ======================================================
// QUOTATION CONVERSION
// ======================================================

const getQuotationConversion =
  asyncHandler(
    async (req, res) => {

      const data =
        await getQuotationConversionService(
          req.user,
          {
            startDate:
              req.query.startDate,

            endDate:
              req.query.endDate,
          }
        );


      return res.status(200).json({

        success: true,

        message:
          "Quotation conversion report fetched successfully.",

        data,

      });
    }
  );


// ======================================================
// EXPORTS
// ======================================================

export {
  getDailySales,
  getMonthlySales,
  getQuotationReport,

  getGSTReport,
  getOutstandingReport,
  getLedgerReport,
  getBankSummary,
  getPaymentReport,

  getTopCustomers,
  getTopProducts,
  getQuotationConversion,
};