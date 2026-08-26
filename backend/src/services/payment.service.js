import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import ApiError from "../exceptions/ApiError.js";
import { notificationService } from "./notification.service.js";
import CustomerRepository from "../repositories/customer.repository.js";

import {
  createPayment as createPaymentRepository,
  findPayments,
  countPayments,
  findPaymentById,
  updatePayment as updatePaymentRepository,
  deletePayment as deletePaymentRepository,
  getPaymentStats as getPaymentStatsRepository,
} from "../repositories/payment.repository.js";

const customerRepository = new CustomerRepository();


// ==========================================
// HELPER: PAYMENT NUMBER
// ==========================================

const generatePaymentNumber = async (companyId) => {
  const lastPayment = await Payment.findOne({
    company: companyId,
  }).sort({ createdAt: -1 });

  if (!lastPayment) {
    return "PAY-0001";
  }

  const lastNumber = parseInt(
    lastPayment.paymentNumber.replace("PAY-", ""),
    10
  );

  return `PAY-${String(lastNumber + 1).padStart(4, "0")}`;
};


// ==========================================
// HELPER: RECALCULATE INVOICE
// ==========================================

const recalculateInvoicePayment = async (invoiceId, companyId) => {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    company: companyId,
  });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found.");
  }

  const payments = await Payment.find({
    invoice: invoiceId,
    company: companyId,
    status: {
      $in: ["PAID", "PARTIALLY_PAID"],
    },
  });

  const amountPaid = payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const balanceDue = Math.max(
    invoice.total - amountPaid,
    0
  );

  invoice.amountPaid = amountPaid;
  invoice.balanceDue = balanceDue;

  if (amountPaid >= invoice.total) {
    invoice.status = "PAID";
  } else if (amountPaid > 0) {
    invoice.status = "PARTIALLY_PAID";
  } else if (!["DRAFT", "CANCELLED"].includes(invoice.status)) {
    // amountPaid fell back to 0 — e.g. the payment(s) that made this
    // invoice PAID/PARTIALLY_PAID were refunded or deleted. Without this,
    // the invoice stayed permanently "PAID" with balanceDue > 0, which also
    // made recalculateOutstanding() below wrongly exclude it (PAID invoices
    // are assumed to be settled).
    invoice.status = "PENDING";
  }

  await invoice.save();

  // Every payment mutation (create/update/status-change/delete) funnels
  // through here, so this is the single choke point that keeps
  // Customer.outstanding in sync with real invoice balances.
  await customerRepository.recalculateOutstanding(
    invoice.customer,
    companyId
  );

  return invoice;
};


// ==========================================
// CREATE PAYMENT
// ==========================================

const createPayment = async (
  paymentData,
  user
) => {
  const {
    customer,
    invoice: invoiceId,
    amount,
  } = paymentData;

  const companyId = user.company;

  if (invoiceId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      company: companyId,
    });

    if (!invoice) {
      throw new ApiError(
        404,
        "Invoice not found."
      );
    }

    const currentBalance = invoice.balanceDue;

    if (amount > currentBalance) {
      throw new ApiError(
        400,
        `Payment amount cannot exceed invoice balance of ${currentBalance}.`
      );
    }
  }

  const paymentNumber =
    await generatePaymentNumber(companyId);

  const payment = await createPaymentRepository({
    ...paymentData,
    paymentNumber,
    company: companyId,
    createdBy: user._id,
  });

  if (invoiceId) {
    await recalculateInvoicePayment(
      invoiceId,
      companyId
    );
  }

  const customerDoc = await Customer.findById(customer);

  await notificationService.notify({
    companyId,
    type: "PAYMENT_RECEIVED",
    title: "Payment received",
    message: `₹${Number(amount).toLocaleString("en-IN")} · ${customerDoc?.customerName ?? "Customer"}`,
    relatedId: payment._id,
  });

  return payment;
};


// ==========================================
// GET ALL PAYMENTS
// ==========================================

const getAllPayments = async (
  user,
  {
    page = 1,
    limit = 10,
    search,
    paymentMode,
    status,
  } = {}
) => {
  const companyId = user.company;

  const query = {
    company: companyId,
  };

  if (paymentMode) {
    query.paymentMode = paymentMode;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      {
        paymentNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        utr: {
          $regex: search,
          $options: "i",
        },
      },
      {
        referenceNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [payments, total] =
    await Promise.all([
      findPayments(query, {
        skip,
        limit,
      }),
      countPayments(query),
    ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// ==========================================
// GET PAYMENT BY ID
// ==========================================

const getPaymentById = async (
  paymentId,
  user
) => {
  const payment = await findPaymentById(
    paymentId,
    user.company
  );

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found."
    );
  }

  return payment;
};


// ==========================================
// UPDATE PAYMENT
// ==========================================

const updatePayment = async (
  paymentId,
  updateData,
  user
) => {
  const companyId = user.company;

  const existingPayment =
    await Payment.findOne({
      _id: paymentId,
      company: companyId,
    });

  if (!existingPayment) {
    throw new ApiError(
      404,
      "Payment not found."
    );
  }

  const oldInvoiceId =
    existingPayment.invoice;

  const newInvoiceId =
    updateData.invoice !== undefined
      ? updateData.invoice
      : existingPayment.invoice;

  if (newInvoiceId) {
    const invoice = await Invoice.findOne({
      _id: newInvoiceId,
      company: companyId,
    });

    if (!invoice) {
      throw new ApiError(
        404,
        "Invoice not found."
      );
    }

    const newAmount =
      updateData.amount ??
      existingPayment.amount;

    const currentPaid =
      await Payment.aggregate([
        {
          $match: {
            invoice: invoice._id,
            company: companyId,
            _id: {
              $ne: existingPayment._id,
            },
            status: {
              $in: [
                "PAID",
                "PARTIALLY_PAID",
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const alreadyPaid =
      currentPaid[0]?.total || 0;

    if (
      ["PAID", "PARTIALLY_PAID"].includes(
        updateData.status ??
          existingPayment.status
      ) &&
      alreadyPaid + newAmount >
        invoice.total
    ) {
      throw new ApiError(
        400,
        "Payment amount exceeds invoice balance."
      );
    }
  }

  const updatedPayment =
    await updatePaymentRepository(
      paymentId,
      companyId,
      updateData
    );

  if (!updatedPayment) {
    throw new ApiError(
      404,
      "Payment not found."
    );
  }

  if (oldInvoiceId) {
    await recalculateInvoicePayment(
      oldInvoiceId,
      companyId
    );
  }

  if (
    newInvoiceId &&
    String(newInvoiceId) !==
      String(oldInvoiceId)
  ) {
    await recalculateInvoicePayment(
      newInvoiceId,
      companyId
    );
  }

  return updatedPayment;
};


// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

const updatePaymentStatus = async (
  paymentId,
  status,
  user
) => {
  const payment =
    await findPaymentById(
      paymentId,
      user.company
    );

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found."
    );
  }

  const updatedPayment =
    await updatePaymentRepository(
      paymentId,
      user.company,
      { status }
    );

  if (payment.invoice) {
    await recalculateInvoicePayment(
      payment.invoice._id,
      user.company
    );
  }

  return updatedPayment;
};


// ==========================================
// DELETE PAYMENT
// ==========================================

const deletePayment = async (
  paymentId,
  user
) => {
  const payment =
    await findPaymentById(
      paymentId,
      user.company
    );

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found."
    );
  }

  const invoiceId =
    payment.invoice?._id ||
    payment.invoice;

  const deletedPayment =
    await deletePaymentRepository(
      paymentId,
      user.company
    );

  if (invoiceId) {
    await recalculateInvoicePayment(
      invoiceId,
      user.company
    );
  }

  return deletedPayment;
};


// ==========================================
// PAYMENT STATS
// ==========================================

const getPaymentStats = async (user) => {
  const result =
    await getPaymentStatsRepository(
      user.company
    );

  return (
    result[0] || {
      totalPayments: 0,
      collected: 0,
      pendingPartial: 0,
      failed: 0,
    }
  );
};


export {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentStats,
};