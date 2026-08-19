import Invoice from "../models/invoice.model.js";
import GSTLedgerEntry from "../models/gstLedgerEntry.model.js";


// ==========================================
// GET GST LEDGER SOURCE DATA
// ==========================================

const getGSTLedgerSourceData = async (
  companyId,
  filters = {}
) => {

  const invoiceQuery = {
    company: companyId,

    // Cancelled invoices should not affect GST ledger
    status: {
      $ne: "CANCELLED",
    },
  };

  const entryQuery = {
    company: companyId,
  };


  // ========================================
  // DATE FILTER
  // ========================================

  if (
    filters.startDate ||
    filters.endDate
  ) {

    const dateFilter = {};


    if (filters.startDate) {

      const startDate =
        new Date(filters.startDate);

      if (
        Number.isNaN(
          startDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid start date."
        );
      }

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      dateFilter.$gte = startDate;
    }


    if (filters.endDate) {

      const endDate =
        new Date(filters.endDate);

      if (
        Number.isNaN(
          endDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid end date."
        );
      }

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      dateFilter.$lte = endDate;
    }


    if (
      Object.keys(dateFilter).length > 0
    ) {

      invoiceQuery.invoiceDate =
        dateFilter;

      entryQuery.date =
        dateFilter;
    }
  }


  // ========================================
  // CUSTOMER FILTER
  // ========================================

  if (filters.customer) {

    invoiceQuery.customer =
      filters.customer;
  }


  // ========================================
  // IMPORTANT
  // ========================================
  //
  // Do NOT apply filters.type here.
  //
  // Invoice GST types such as:
  // OUTPUT_CGST
  // OUTPUT_SGST
  // OUTPUT_IGST
  //
  // are generated dynamically from Invoice.
  //
  // Therefore type filtering must happen
  // AFTER invoice + manual entries are
  // converted into one GST ledger.
  //
  // ========================================


  // ========================================
  // FETCH SOURCE DATA
  // ========================================

  const [
    invoices,
    ledgerEntries,
  ] = await Promise.all([

    Invoice.find(invoiceQuery)
      .populate(
        "customer",
        "customerName phone email"
      )
      .select(
        [
          "invoiceNumber",
          "customer",
          "invoiceDate",
          "cgst",
          "sgst",
          "igst",
          "total",
          "status",
          "createdAt",
        ].join(" ")
      )
      .sort({
        invoiceDate: 1,
        createdAt: 1,
      })
      .lean(),


    GSTLedgerEntry.find(entryQuery)
      .sort({
        date: 1,
        createdAt: 1,
      })
      .lean(),
  ]);


  return {
    invoices,
    ledgerEntries,
  };
};


// ==========================================
// CREATE GST LEDGER ENTRY
// ==========================================

const createGSTLedgerEntry = async (
  data
) => {

  return await GSTLedgerEntry.create(
    data
  );
};


// ==========================================
// GET GST LEDGER ENTRY BY ID
// ==========================================

const getGSTLedgerEntryById = async (
  entryId,
  companyId
) => {

  return await GSTLedgerEntry.findOne({
    _id: entryId,
    company: companyId,
  }).lean();
};


// ==========================================
// DELETE GST LEDGER ENTRY
// ==========================================

const deleteGSTLedgerEntry = async (
  entryId,
  companyId
) => {

  return await GSTLedgerEntry.findOneAndDelete(
    {
      _id: entryId,
      company: companyId,
    }
  );
};


// ==========================================
// FIND GST ENTRY BY ENTRY NUMBER
// ==========================================

const findGSTEntryByEntryNumber = async (
  entryNumber,
  companyId
) => {

  return await GSTLedgerEntry.findOne({
    entryNumber,
    company: companyId,
  }).lean();
};


export {
  getGSTLedgerSourceData,
  createGSTLedgerEntry,
  getGSTLedgerEntryById,
  deleteGSTLedgerEntry,
  findGSTEntryByEntryNumber,
};