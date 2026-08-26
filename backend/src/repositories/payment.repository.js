import Payment from "../models/payment.model.js";
import Customer from "../models/customer.model.js";
import Invoice from "../models/invoice.model.js";

const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

// Expands a { $or: [...] } search clause already containing
// paymentNumber/utr/referenceNumber matches (built in payment.service.js)
// with customer-name and invoice-number lookups, mirroring the same
// pattern used in quotation.repository.js / invoice.repository.js.
const expandSearchQuery = async (query) => {
  if (!query.$or) return query;

  const searchTerm = query.$or[0]?.paymentNumber?.$regex;
  if (!searchTerm) return query;

  const [matchingCustomers, matchingInvoices] = await Promise.all([
    Customer.find({
      company: query.company,
      customerName: { $regex: searchTerm, $options: "i" },
    }).select("_id"),

    Invoice.find({
      company: query.company,
      invoiceNumber: { $regex: searchTerm, $options: "i" },
    }).select("_id"),
  ]);

  return {
    ...query,
    $or: [
      ...query.$or,
      { customer: { $in: matchingCustomers.map((c) => c._id) } },
      { invoice: { $in: matchingInvoices.map((i) => i._id) } },
    ],
  };
};

const findPayments = async (query, options = {}) => {
  const {
    skip = 0,
    limit = 10,
    sort = { createdAt: -1 },
  } = options;

  const expandedQuery = await expandSearchQuery(query);

  return await Payment.find(expandedQuery)
    .populate("customer")
    .populate("invoice")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

const countPayments = async (query) => {
  const expandedQuery = await expandSearchQuery(query);
  return await Payment.countDocuments(expandedQuery);
};

const findPaymentById = async (paymentId, companyId) => {
  return await Payment.findOne({
    _id: paymentId,
    company: companyId,
  })
    .populate("customer")
    .populate("invoice");
};

const updatePayment = async (
  paymentId,
  companyId,
  updateData
) => {
  return await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      company: companyId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("customer")
    .populate("invoice");
};

const deletePayment = async (paymentId, companyId) => {
  return await Payment.findOneAndDelete({
    _id: paymentId,
    company: companyId,
  });
};

const getPaymentStats = async (companyId) => {
  return await Payment.aggregate([
    {
      $match: {
        company: companyId,
      },
    },
    {
      $group: {
        _id: null,

        totalPayments: {
          $sum: 1,
        },

        // A payment record's own status reflects whether that transaction
        // itself succeeded — PAID and PARTIALLY_PAID both represent real
        // money received (the `amount` field is what actually came in);
        // PENDING/FAILED/REFUNDED are correctly excluded since no money is
        // currently held for those.
        collected: {
          $sum: {
            $cond: [
              { $in: ["$status", ["PAID", "PARTIALLY_PAID"]] },
              "$amount",
              0,
            ],
          },
        },

        pendingPartial: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  ["PENDING", "PARTIALLY_PAID"],
                ],
              },
              "$amount",
              0,
            ],
          },
        },

        failed: {
          $sum: {
            $cond: [
              { $eq: ["$status", "FAILED"] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
};

export {
  createPayment,
  findPayments,
  countPayments,
  findPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStats,
};