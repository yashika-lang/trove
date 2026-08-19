import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import { convertToCSV } from "../utils/csvExport.js";


import {
  getGSTLedger,
  createGSTLedgerEntry,
  getGSTLedgerEntryById,
  deleteGSTLedgerEntry,
} from "../services/gstLedger.service.js";


// ==========================================
// GET GST LEDGER
// ==========================================

const getGSTLedgerController =
  asyncHandler(async (req, res) => {

    const {
      type,
      search,
      customer,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;


    const result =
      await getGSTLedger(
        req.user,
        {
          type,
          search,
          customer,
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
        "GST ledger fetched successfully."
      )
    );
  });


// ==========================================
// CREATE GST ENTRY
// ==========================================

const createGSTLedgerEntryController =
  asyncHandler(async (req, res) => {

    const result =
      await createGSTLedgerEntry(
        req.body,
        req.user
      );


    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "GST ledger entry created successfully."
      )
    );
  });


// ==========================================
// GET GST ENTRY BY ID
// ==========================================

const getGSTLedgerEntryByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await getGSTLedgerEntryById(
        req.params.entryId,
        req.user
      );


    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST ledger entry fetched successfully."
      )
    );
  });


// ==========================================
// DELETE GST ENTRY
// ==========================================

const deleteGSTLedgerEntryController =
  asyncHandler(async (req, res) => {

    const result =
      await deleteGSTLedgerEntry(
        req.params.entryId,
        req.user
      );


    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST ledger entry deleted successfully."
      )
    );
  });
  // ==========================================
// EXPORT GST LEDGER
// Admin + Accountant
// ==========================================

const exportGSTLedgerController = asyncHandler(
  async (req, res) => {

    const {
      type,
      search,
      customer,
      startDate,
      endDate,
    } = req.query;


    const result = await getGSTLedger(
      req.user,
      {
        type,
        search,
        customer,
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

        Type:
          entry.type || "",

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
        "Type",
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
      'attachment; filename="gst-ledger.csv"'
    );


    return res.status(200).send(csv);
  }
);


export {
  getGSTLedgerController,
  createGSTLedgerEntryController,
  getGSTLedgerEntryByIdController,
  deleteGSTLedgerEntryController,
  exportGSTLedgerController,
};