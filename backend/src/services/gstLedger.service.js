import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import {
  getGSTLedgerSourceData,
  createGSTLedgerEntry as createGSTLedgerEntryRepository,
  getGSTLedgerEntryById as getGSTLedgerEntryByIdRepository,
  deleteGSTLedgerEntry as deleteGSTLedgerEntryRepository,
} from "../repositories/gstLedger.repository.js";


// ==========================================
// CONSTANTS
// ==========================================

const GST_TYPES = [
  "OUTPUT_CGST",
  "OUTPUT_SGST",
  "OUTPUT_IGST",

  "INPUT_CGST",
  "INPUT_SGST",
  "INPUT_IGST",

  "GST_PAYMENT",
];


// ==========================================
// VALIDATE COMPANY
// ==========================================

const validateCompany = (user) => {
  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }
};


// ==========================================
// VALIDATE DATE FILTERS
// ==========================================

const validateDateFilters = (filters = {}) => {
  let startDate = null;
  let endDate = null;

  if (filters.startDate) {
    startDate = new Date(filters.startDate);

    if (Number.isNaN(startDate.getTime())) {
      throw new ApiError(
        400,
        "Invalid start date."
      );
    }

    startDate.setHours(
      0,
      0,
      0,
      0
    );
  }

  if (filters.endDate) {
    endDate = new Date(filters.endDate);

    if (Number.isNaN(endDate.getTime())) {
      throw new ApiError(
        400,
        "Invalid end date."
      );
    }

    endDate.setHours(
      23,
      59,
      59,
      999
    );
  }

  if (
    startDate &&
    endDate &&
    startDate > endDate
  ) {
    throw new ApiError(
      400,
      "Start date cannot be after end date."
    );
  }

  return {
    startDate,
    endDate,
  };
};


// ==========================================
// VALIDATE GST TYPE
// ==========================================

const validateGSTType = (type) => {
  if (
    type &&
    !GST_TYPES.includes(type)
  ) {
    throw new ApiError(
      400,
      `Invalid GST type. Allowed types: ${GST_TYPES.join(
        ", "
      )}.`
    );
  }
};


// ==========================================
// PAGINATION
// ==========================================

const getPagination = (filters = {}) => {
  const page =
    Number(filters.page) || 1;

  const limit =
    Number(filters.limit) || 10;

  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    throw new ApiError(
      400,
      "Page must be a positive integer."
    );
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    throw new ApiError(
      400,
      "Limit must be a positive integer."
    );
  }

  if (limit > 100) {
    throw new ApiError(
      400,
      "Limit cannot be greater than 100."
    );
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};


// ==========================================
// BUILD GST ENTRIES FROM INVOICES
// ==========================================

const buildInvoiceGSTEntries = (invoices) => {
  const entries = [];

  for (const invoice of invoices) {
    const cgst =
      Number(invoice.cgst) || 0;

    const sgst =
      Number(invoice.sgst) || 0;

    const igst =
      Number(invoice.igst) || 0;


    // --------------------------------------
    // OUTPUT CGST
    // --------------------------------------

    if (cgst > 0) {
      entries.push({
        source: "INVOICE",

        sourceId:
          invoice._id,

        date:
          invoice.invoiceDate,

        particular:
          `Output CGST - ${invoice.invoiceNumber}`,

        referenceNumber:
          invoice.invoiceNumber,

        account: "CGST",

        type: "OUTPUT_CGST",

        debit: 0,

        credit: cgst,

        customer:
          invoice.customer
            ? {
                _id:
                  invoice.customer._id,

                customerName:
                  invoice.customer.customerName,
              }
            : null,
      });
    }


    // --------------------------------------
    // OUTPUT SGST
    // --------------------------------------

    if (sgst > 0) {
      entries.push({
        source: "INVOICE",

        sourceId:
          invoice._id,

        date:
          invoice.invoiceDate,

        particular:
          `Output SGST - ${invoice.invoiceNumber}`,

        referenceNumber:
          invoice.invoiceNumber,

        account: "SGST",

        type: "OUTPUT_SGST",

        debit: 0,

        credit: sgst,

        customer:
          invoice.customer
            ? {
                _id:
                  invoice.customer._id,

                customerName:
                  invoice.customer.customerName,
              }
            : null,
      });
    }


    // --------------------------------------
    // OUTPUT IGST
    // --------------------------------------

    if (igst > 0) {
      entries.push({
        source: "INVOICE",

        sourceId:
          invoice._id,

        date:
          invoice.invoiceDate,

        particular:
          `Output IGST - ${invoice.invoiceNumber}`,

        referenceNumber:
          invoice.invoiceNumber,

        account: "IGST",

        type: "OUTPUT_IGST",

        debit: 0,

        credit: igst,

        customer:
          invoice.customer
            ? {
                _id:
                  invoice.customer._id,

                customerName:
                  invoice.customer.customerName,
              }
            : null,
      });
    }
  }

  return entries;
};


// ==========================================
// BUILD MANUAL GST ENTRIES
// ==========================================

const buildManualGSTEntries = (
  ledgerEntries
) => {
  return ledgerEntries.map(
    (entry) => ({
      source: "GST_ENTRY",

      sourceId:
        entry._id,

      date:
        entry.date,

      particular:
        entry.particular,

      referenceNumber:
        entry.referenceNumber || null,

      account:
        entry.account,

      type:
        entry.type,

      debit:
        Number(entry.debit) || 0,

      credit:
        Number(entry.credit) || 0,

      remarks:
        entry.remarks || null,

      customer: null,
    })
  );
};


// ==========================================
// SORT ENTRIES
// ==========================================

const sortGSTEntries = (entries) => {
  entries.sort((a, b) => {
    const dateA =
      new Date(a.date).getTime();

    const dateB =
      new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return String(
      a.referenceNumber || ""
    ).localeCompare(
      String(
        b.referenceNumber || ""
      )
    );
  });

  return entries;
};


// ==========================================
// SEARCH ENTRIES
// ==========================================

const applySearchFilter = (
  entries,
  search
) => {
  if (!search) {
    return entries;
  }

  const searchText =
    String(search)
      .trim()
      .toLowerCase();

  if (!searchText) {
    return entries;
  }

  return entries.filter(
    (entry) => {
      return (
        String(
          entry.particular || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          entry.referenceNumber || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          entry.type || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          entry.account || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          entry.customer
            ?.customerName || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    }
  );
};


// ==========================================
// ADD RUNNING BALANCE
// ==========================================

const addRunningBalance = (
  entries,
  openingBalance = 0
) => {
  let balance =
    openingBalance;

  return entries.map(
    (entry) => {
      balance +=
        (Number(entry.credit) || 0) -
        (Number(entry.debit) || 0);

      return {
        ...entry,
        balance,
      };
    }
  );
};


// ==========================================
// GET GST LEDGER
// ==========================================

const getGSTLedger = async (
  user,
  filters = {}
) => {
  validateCompany(user);

  const {
    startDate,
    endDate,
  } =
    validateDateFilters(filters);

  validateGSTType(
    filters.type
  );

  const {
    page,
    limit,
    skip,
  } =
    getPagination(filters);


  // ========================================
  // FETCH CURRENT PERIOD DATA
  // ========================================

  const {
    invoices,
    ledgerEntries,
  } =
    await getGSTLedgerSourceData(
      user.company,
      filters
    );


  // ========================================
  // BUILD CURRENT PERIOD ENTRIES
  // ========================================

  let allEntries = [
    ...buildInvoiceGSTEntries(
      invoices
    ),

    ...buildManualGSTEntries(
      ledgerEntries
    ),
  ];


  sortGSTEntries(
    allEntries
  );


  // ========================================
  // OPENING BALANCE
  // ========================================
  //
  // IMPORTANT:
  // Opening balance means all GST movement
  // BEFORE selected start date.
  //
  // Search/type filter must NOT affect it.
  //
  // ========================================

  let openingBalance = 0;


  if (startDate) {

    // --------------------------------------
    // Fetch ONLY transactions before
    // selected start date.
    // --------------------------------------

    const openingEndDate =
      new Date(startDate);

    openingEndDate.setMilliseconds(
      openingEndDate.getMilliseconds() - 1
    );


    const {
      invoices:
        openingInvoices,
      ledgerEntries:
        openingLedgerEntries,
    } =
      await getGSTLedgerSourceData(
        user.company,
        {
          // Keep customer filter because
          // opening balance should belong to
          // the same customer scope.
          customer:
            filters.customer,

          endDate:
            openingEndDate,
        }
      );


    const openingEntries = [
      ...buildInvoiceGSTEntries(
        openingInvoices
      ),

      ...buildManualGSTEntries(
        openingLedgerEntries
      ),
    ];


    // --------------------------------------
    // Calculate opening balance
    // --------------------------------------

    for (
      const entry of openingEntries
    ) {
      openingBalance +=
        (Number(entry.credit) || 0) -
        (Number(entry.debit) || 0);
    }
  }


  // ========================================
  // RUNNING BALANCE
  // ========================================

  const entriesWithBalance =
    addRunningBalance(
      allEntries,
      openingBalance
    );


  // ========================================
  // TYPE FILTER
  // ========================================

  let filteredEntries =
    entriesWithBalance;

  if (filters.type) {
    filteredEntries =
      filteredEntries.filter(
        (entry) =>
          entry.type ===
          filters.type
      );
  }


  // ========================================
  // CUSTOMER FILTER
  // ========================================

  if (filters.customer) {
    filteredEntries =
      filteredEntries.filter(
        (entry) =>
          entry.customer?._id?.toString() ===
          filters.customer.toString()
      );
  }


  // ========================================
  // SEARCH
  // ========================================

  filteredEntries =
    applySearchFilter(
      filteredEntries,
      filters.search
    );


  // ========================================
  // SUMMARY
  // ========================================

  const totalDebit =
    filteredEntries.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.debit) || 0),
      0
    );


  const totalCredit =
    filteredEntries.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.credit) || 0),
      0
    );


  // ========================================
  // CLOSING BALANCE
  // ========================================

  const closingBalance =
    openingBalance +
    totalCredit -
    totalDebit;


  // ========================================
  // GST SUMMARY
  // ========================================

  const outputCGST =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "OUTPUT_CGST"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.credit) || 0),
        0
      );


  const outputSGST =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "OUTPUT_SGST"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.credit) || 0),
        0
      );


  const outputIGST =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "OUTPUT_IGST"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.credit) || 0),
        0
      );


  const inputCGST =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "INPUT_CGST"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.debit) || 0),
        0
      );


  const inputSGST =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "INPUT_SGST"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.debit) || 0),
        0
      );


  const inputIGST =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "INPUT_IGST"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.debit) || 0),
        0
      );


  const gstPaid =
    filteredEntries
      .filter(
        (entry) =>
          entry.type ===
          "GST_PAYMENT"
      )
      .reduce(
        (sum, entry) =>
          sum +
          (Number(entry.debit) || 0),
        0
      );


  // ========================================
  // PAGINATION
  // ========================================

  const total =
    filteredEntries.length;

  const totalPages =
    Math.ceil(
      total / limit
    );

  const paginatedEntries =
    filteredEntries.slice(
      skip,
      skip + limit
    );


  // ========================================
  // FINAL RESPONSE
  // ========================================

  return {
    openingBalance,

    entries:
      paginatedEntries,

    summary: {
      totalDebit,
      totalCredit,
      closingBalance,

      outputCGST,
      outputSGST,
      outputIGST,

      inputCGST,
      inputSGST,
      inputIGST,

      gstPaid,
    },

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};


// ==========================================
// GENERATE GST ENTRY NUMBER
// ==========================================

const generateEntryNumber = async (
  companyId
) => {

  const {
    ledgerEntries,
  } =
    await getGSTLedgerSourceData(
      companyId,
      {}
    );

  let maxNumber = 0;

  for (
    const entry of ledgerEntries
  ) {

    if (
      !entry.entryNumber
    ) {
      continue;
    }

    const match =
      entry.entryNumber.match(
        /^GST-(\d+)$/
      );

    if (!match) {
      continue;
    }

    const number =
      parseInt(
        match[1],
        10
      );

    if (
      !Number.isNaN(number) &&
      number > maxNumber
    ) {
      maxNumber =
        number;
    }
  }

  return `GST-${String(
    maxNumber + 1
  ).padStart(4, "0")}`;
};


// ==========================================
// CREATE GST LEDGER ENTRY
// ==========================================

const createGSTLedgerEntry = async (
  data,
  user
) => {

  validateCompany(user);


  // ========================================
  // ALLOWED MANUAL TYPES
  // ========================================

  const allowedTypes = [
    "INPUT_CGST",
    "INPUT_SGST",
    "INPUT_IGST",
    "GST_PAYMENT",
  ];

  if (
    !allowedTypes.includes(
      data.type
    )
  ) {
    throw new ApiError(
      400,
      "Invalid GST ledger entry type."
    );
  }


  // ========================================
  // EXPECTED ACCOUNT
  // ========================================

  const expectedAccount = {
    INPUT_CGST:
      "CGST",

    INPUT_SGST:
      "SGST",

    INPUT_IGST:
      "IGST",

    GST_PAYMENT:
      "ELECTRONIC_CASH",
  };

  if (
    data.account !==
    expectedAccount[data.type]
  ) {
    throw new ApiError(
      400,
      "Invalid GST account for selected entry type."
    );
  }


  // ========================================
  // AMOUNT
  // ========================================

  const debit =
    Number(data.debit) || 0;

  const credit =
    Number(data.credit) || 0;


  if (
    debit <= 0 &&
    credit <= 0
  ) {
    throw new ApiError(
      400,
      "Either debit or credit amount is required."
    );
  }


  if (
    debit > 0 &&
    credit > 0
  ) {
    throw new ApiError(
      400,
      "Debit and credit cannot both have values."
    );
  }


  // ========================================
  // INPUT GST / GST PAYMENT
  // MUST BE DEBIT
  // ========================================

  if (debit <= 0) {
    throw new ApiError(
      400,
      "Input GST and GST payment entries must be debit entries."
    );
  }


  // ========================================
  // PARTICULAR
  // ========================================

  if (
    !data.particular ||
    !data.particular.trim()
  ) {
    throw new ApiError(
      400,
      "Particular is required."
    );
  }


  // ========================================
  // DATE
  // ========================================

  const date =
    new Date(data.date);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new ApiError(
      400,
      "Invalid GST entry date."
    );
  }


  // ========================================
  // ENTRY NUMBER
  // ========================================

  const entryNumber =
    await generateEntryNumber(
      user.company
    );


  // ========================================
  // CREATE
  // ========================================

  const entry =
    await createGSTLedgerEntryRepository({
      entryNumber,

      date,

      type:
        data.type,

      particular:
        data.particular.trim(),

      referenceNumber:
        data.referenceNumber
          ?.trim() || null,

      account:
        data.account,

      debit,

      credit: 0,

      remarks:
        data.remarks
          ?.trim() || null,

      company:
        user.company,

      createdBy:
        user._id,
    });


  return entry;
};


// ==========================================
// GET GST LEDGER ENTRY BY ID
// ==========================================

const getGSTLedgerEntryById = async (
  entryId,
  user
) => {

  validateCompany(user);

  if (
    !mongoose.Types.ObjectId.isValid(
      entryId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid GST ledger entry ID."
    );
  }


  const entry =
    await getGSTLedgerEntryByIdRepository(
      entryId,
      user.company
    );


  if (!entry) {
    throw new ApiError(
      404,
      "GST ledger entry not found."
    );
  }


  return entry;
};


// ==========================================
// DELETE GST LEDGER ENTRY
// ==========================================

const deleteGSTLedgerEntry = async (
  entryId,
  user
) => {

  validateCompany(user);

  if (
    !mongoose.Types.ObjectId.isValid(
      entryId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid GST ledger entry ID."
    );
  }


  const entry =
    await getGSTLedgerEntryByIdRepository(
      entryId,
      user.company
    );


  if (!entry) {
    throw new ApiError(
      404,
      "GST ledger entry not found."
    );
  }


  await deleteGSTLedgerEntryRepository(
    entryId,
    user.company
  );


  return entry;
};


// ==========================================
// EXPORT
// ==========================================

export {
  getGSTLedger,
  createGSTLedgerEntry,
  getGSTLedgerEntryById,
  deleteGSTLedgerEntry,
};