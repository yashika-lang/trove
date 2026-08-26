import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import { convertToCSV } from "../utils/csvExport.js";
import {
  getCustomerLedger,
  getCompanyLedger,
} from "../services/ledger.service.js";


// ==========================================
// CUSTOMER LEDGER
// ==========================================

const getCustomerLedgerController = asyncHandler(
  async (req, res) => {
    const {
      type,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result = await getCustomerLedger(
      req.params.customerId,
      req.user,
      {
        type,
        search,
        startDate,
        endDate,
        page,
        limit,
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Customer ledger fetched successfully."
      )
    );
  }
);



// ==========================================
// COMPANY LEDGER
// ==========================================

const getCompanyLedgerController = asyncHandler(
  async (req, res) => {
    const {
      customer,
      type,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result = await getCompanyLedger(
      req.user,
      {
        customer,
        type,
        search,
        startDate,
        endDate,
        page,
        limit,
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Company ledger fetched successfully."
      )
    );
  }
);
// ==========================================
// EXPORT COMPANY LEDGER
// ==========================================

const exportCompanyLedgerController = asyncHandler(
  async (req, res) => {

    const {
      customer,
      type,
      search,
      startDate,
      endDate,
    } = req.query;


    const result = await getCompanyLedger(
      req.user,
      {
        customer,
        type,
        search,
        startDate,
        endDate,

        // Export should contain all filtered entries
        page: 1,
        limit: 100000,
      }
    );


    const csvData = result.entries.map(
      (entry) => ({
        Date: entry.date
          ? new Date(entry.date)
              .toISOString()
              .split("T")[0]
          : "",

        Particular:
          entry.particular || "",

        Account:
          entry.account || "",

        Reference:
          entry.referenceNumber || "",

        Debit:
          entry.debit || 0,

        Credit:
          entry.credit || 0,

        Balance:
          entry.balance || 0,
      })
    );


    const csv = convertToCSV(
      csvData,
      [
        "Date",
        "Particular",
        "Account",
        "Reference",
        "Debit",
        "Credit",
        "Balance",
      ]
    );


    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="customer-ledger.csv"'
    );


    return res.status(200).send(csv);
  }
);


// ==========================================
// EXPORT CUSTOMER LEDGER
// ==========================================

const exportCustomerLedgerController = asyncHandler(
  async (req, res) => {

    const {
      type,
      search,
      startDate,
      endDate,
    } = req.query;


    const result = await getCustomerLedger(
      req.params.customerId,
      req.user,
      {
        type,
        search,
        startDate,
        endDate,

        // Export should contain all filtered entries
        page: 1,
        limit: 100000,
      }
    );


    const csvData = result.entries.map(
      (entry) => ({
        Date: entry.date
          ? new Date(entry.date)
              .toISOString()
              .split("T")[0]
          : "",

        Particular:
          entry.particular || "",

        Account:
          entry.account || "",

        Reference:
          entry.referenceNumber || "",

        Debit:
          entry.debit || 0,

        Credit:
          entry.credit || 0,

        Balance:
          entry.balance || 0,
      })
    );


    const csv = convertToCSV(
      csvData,
      [
        "Date",
        "Particular",
        "Account",
        "Reference",
        "Debit",
        "Credit",
        "Balance",
      ]
    );


    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="customer-ledger-${req.params.customerId}.csv"`
    );


    return res.status(200).send(csv);
  }
);
export {
  getCustomerLedgerController,
  getCompanyLedgerController,
  exportCompanyLedgerController,
  exportCustomerLedgerController,
};