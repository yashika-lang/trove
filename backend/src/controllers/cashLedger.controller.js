import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import { convertToCSV } from "../utils/csvExport.js";

import {
  createCashLedger,
  getCashLedger,
  getCashLedgerById,
  updateCashLedger,
  deleteCashLedger,
  getCashLedgerStats,
} from "../services/cashLedger.service.js";


// ==========================================
// CREATE CASH LEDGER ENTRY
// ==========================================

const createCashLedgerEntry = asyncHandler(
  async (req, res) => {

    const entry =
      await createCashLedger(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        entry,
        "Cash ledger entry created successfully."
      )
    );
  }
);


// ==========================================
// GET CASH LEDGER
// ==========================================

const getCashLedgerEntries = asyncHandler(
  async (req, res) => {

    const {
      type,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;


    const result =
      await getCashLedger(
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
        "Cash ledger fetched successfully."
      )
    );
  }
);


// ==========================================
// GET CASH LEDGER ENTRY BY ID
// ==========================================

const getCashLedgerEntry = asyncHandler(
  async (req, res) => {

    const entry =
      await getCashLedgerById(
        req.params.entryId,
        req.user
      );


    return res.status(200).json(
      new ApiResponse(
        200,
        entry,
        "Cash ledger entry fetched successfully."
      )
    );
  }
);


// ==========================================
// UPDATE CASH LEDGER ENTRY
// ==========================================

const updateCashLedgerEntry = asyncHandler(
  async (req, res) => {

    const entry =
      await updateCashLedger(
        req.params.entryId,
        req.body,
        req.user
      );


    return res.status(200).json(
      new ApiResponse(
        200,
        entry,
        "Cash ledger entry updated successfully."
      )
    );
  }
);


// ==========================================
// DELETE CASH LEDGER ENTRY
// ==========================================

const deleteCashLedgerEntry = asyncHandler(
  async (req, res) => {

    const entry =
      await deleteCashLedger(
        req.params.entryId,
        req.user
      );


    return res.status(200).json(
      new ApiResponse(
        200,
        entry,
        "Cash ledger entry deleted successfully."
      )
    );
  }
);


// ==========================================
// CASH LEDGER STATS
// ==========================================

const getCashLedgerStatsController =
  asyncHandler(
    async (req, res) => {

      const stats =
        await getCashLedgerStats(
          req.user
        );


      return res.status(200).json(
        new ApiResponse(
          200,
          stats,
          "Cash ledger statistics fetched successfully."
        )
      );
    }
  );
  // ==========================================
// EXPORT CASH LEDGER
// ==========================================

const exportCashLedgerController = asyncHandler(
  async (req, res) => {

    const {
      type,
      search,
      startDate,
      endDate,
    } = req.query;


    const result = await getCashLedger(
      req.user,
      {
        type,
        search,
        startDate,
        endDate,

        // Export all filtered entries
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
      'attachment; filename="cash-ledger.csv"'
    );


    return res.status(200).send(csv);
  }
);


// ==========================================
// EXPORT
// ==========================================

export {
  createCashLedgerEntry,
  getCashLedgerEntries,
  getCashLedgerEntry,
  updateCashLedgerEntry,
  deleteCashLedgerEntry,
  getCashLedgerStatsController,
  exportCashLedgerController,
};