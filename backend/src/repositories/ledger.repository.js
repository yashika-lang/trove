import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";


// ==========================================
// BUILD DATE FILTER
// ==========================================

const buildDateFilter = (filters = {}) => {
  if (
    !filters.startDate &&
    !filters.endDate
  ) {
    return null;
  }

  const dateFilter = {};


  // ----------------------------------------
  // START DATE
  // ----------------------------------------

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

    dateFilter.$gte =
      startDate;
  }


  // ----------------------------------------
  // END DATE
  // ----------------------------------------

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

    dateFilter.$lte =
      endDate;
  }


  // ----------------------------------------
  // INVALID RANGE
  // ----------------------------------------

  if (
    dateFilter.$gte &&
    dateFilter.$lte &&
    dateFilter.$gte >
      dateFilter.$lte
  ) {
    throw new Error(
      "Start date cannot be after end date."
    );
  }


  return dateFilter;
};


// ==========================================
// GET CUSTOMER LEDGER SOURCE DATA
// ==========================================

const getCustomerLedgerSourceData = async (
  companyId,
  customerId,
  filters = {}
) => {

  const invoiceQuery = {
    company: companyId,
    customer: customerId,

    status: {
      $ne: "CANCELLED",
    },
  };


  const paymentQuery = {
    company: companyId,
    customer: customerId,

    // Only PAID / PARTIALLY_PAID payments are real cash received — a
    // FAILED, PENDING, or REFUNDED payment must not appear as a credit
    // here, matching the same status filter used for Customer.outstanding
    // and the Payments page "collected" stat.
    status: {
      $in: ["PAID", "PARTIALLY_PAID"],
    },
  };


  // ----------------------------------------
  // DATE FILTER
  // ----------------------------------------

  const dateFilter =
    buildDateFilter(filters);


  if (dateFilter) {

    invoiceQuery.invoiceDate =
      dateFilter;

    paymentQuery.paymentDate =
      dateFilter;
  }


  // ----------------------------------------
  // FETCH INVOICES + PAYMENTS
  // ----------------------------------------

  const [
    invoices,
    payments,
  ] = await Promise.all([

    Invoice.find(invoiceQuery)
      .populate(
        "customer",
        "customerName phone email"
      )
      .select(
        [
          "_id",
          "invoiceNumber",
          "customer",
          "invoiceDate",
          "total",
          "amountPaid",
          "balanceDue",
          "status",
          "createdAt",
        ].join(" ")
      )
      .sort({
        invoiceDate: 1,
        createdAt: 1,
      })
      .lean(),


    Payment.find(paymentQuery)
      .populate(
        "customer",
        "customerName phone email"
      )
      .populate(
        "invoice",
        "invoiceNumber total"
      )
      .select(
        [
          "_id",
          "customer",
          "invoice",
          "amount",
          "paymentDate",
          "paymentMethod",
          "paymentNumber",
          "referenceNumber",
          "status",
          "createdAt",
        ].join(" ")
      )
      .sort({
        paymentDate: 1,
        createdAt: 1,
      })
      .lean(),
  ]);


  return {
    invoices,
    payments,
  };
};


// ==========================================
// GET ALL COMPANY LEDGER SOURCE DATA
// ==========================================

const getCompanyLedgerSourceData = async (
  companyId,
  filters = {}
) => {

  const invoiceQuery = {
    company: companyId,

    status: {
      $ne: "CANCELLED",
    },
  };


  const paymentQuery = {
    company: companyId,

    // See getCustomerLedgerSourceData — only real cash received counts.
    status: {
      $in: ["PAID", "PARTIALLY_PAID"],
    },
  };


  // ----------------------------------------
  // DATE FILTER
  // ----------------------------------------

  const dateFilter =
    buildDateFilter(filters);


  if (dateFilter) {

    invoiceQuery.invoiceDate =
      dateFilter;

    paymentQuery.paymentDate =
      dateFilter;
  }


  // ----------------------------------------
  // CUSTOMER FILTER
  // ----------------------------------------

  if (filters.customer) {

    invoiceQuery.customer =
      filters.customer;

    paymentQuery.customer =
      filters.customer;
  }


  // ----------------------------------------
  // FETCH
  // ----------------------------------------

  const [
    invoices,
    payments,
  ] = await Promise.all([

    Invoice.find(invoiceQuery)
      .populate(
        "customer",
        "customerName phone email"
      )
      .select(
        [
          "_id",
          "invoiceNumber",
          "customer",
          "invoiceDate",
          "total",
          "amountPaid",
          "balanceDue",
          "status",
          "createdAt",
        ].join(" ")
      )
      .sort({
        invoiceDate: 1,
        createdAt: 1,
      })
      .lean(),


    Payment.find(paymentQuery)
      .populate(
        "customer",
        "customerName phone email"
      )
      .populate(
        "invoice",
        "invoiceNumber total"
      )
      .select(
        [
          "_id",
          "customer",
          "invoice",
          "amount",
          "paymentDate",
          "amount",
          "paymentMethod",
          "paymentNumber",
          "referenceNumber",
          "status",
          "createdAt",
        ].join(" ")
      )
      .sort({
        paymentDate: 1,
        createdAt: 1,
      })
      .lean(),
  ]);


  return {
    invoices,
    payments,
  };
};


// ==========================================
// GET CUSTOMER OPENING BALANCE
// ==========================================
//
// Anything BEFORE startDate is opening balance.
//
// Invoice  -> DEBIT
// Payment -> CREDIT
//
// Opening Balance =
// Previous Debits - Previous Credits
// ==========================================

const getCustomerOpeningData = async (
  companyId,
  customerId,
  beforeDate
) => {

  const date =
    new Date(beforeDate);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid opening balance date."
    );
  }


  const [
    invoices,
    payments,
  ] = await Promise.all([

    Invoice.find({
      company: companyId,
      customer: customerId,

      status: {
        $ne: "CANCELLED",
      },

      invoiceDate: {
        $lt: date,
      },
    })
      .select(
        "total invoiceDate"
      )
      .lean(),


    Payment.find({
      company: companyId,
      customer: customerId,

      status: {
        $in: ["PAID", "PARTIALLY_PAID"],
      },

      paymentDate: {
        $lt: date,
      },
    })
      .select(
        "amount paymentDate"
      )
      .lean(),
  ]);


  // ----------------------------------------
  // TOTAL PREVIOUS DEBIT
  // ----------------------------------------

  const totalDebit =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.total || 0
        ),
      0
    );


  // ----------------------------------------
  // TOTAL PREVIOUS CREDIT
  // ----------------------------------------

  const totalCredit =
    payments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );


  // ----------------------------------------
  // OPENING BALANCE
  // ----------------------------------------

  const openingBalance =
    totalDebit -
    totalCredit;


  return {

    totalDebit,

    totalCredit,

    openingBalance,
  };
};


export {
  getCustomerLedgerSourceData,
  getCompanyLedgerSourceData,
  getCustomerOpeningData,
};