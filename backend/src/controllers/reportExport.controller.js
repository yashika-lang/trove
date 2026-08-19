import asyncHandler from "../exceptions/asyncHandler.js";

import {
  exportReport,
} from "../services/reportExport.service.js";


// ==========================================
// EXPORT REPORT
// ==========================================

const exportReportController =
  asyncHandler(
    async (req, res) => {

      const {
        reportName,
      } = req.params;


      const {
        format = "csv",
        ...filters
      } = req.query;


      const result =
        await exportReport(
          reportName,
          format,
          req.user,
          filters
        );


      // ====================================
      // HEADERS
      // ====================================

      res.setHeader(
        "Content-Type",
        result.contentType
      );


      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`
      );


      // ====================================
      // SEND FILE
      // ====================================

      return res
        .status(200)
        .send(
          result.buffer
        );

    }
  );


export {
  exportReportController,
};