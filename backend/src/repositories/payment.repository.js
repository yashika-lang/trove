import Payment from "../models/payment.model.js";

const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

const findPayments = async (query, options = {}) => {
  const {
    skip = 0,
    limit = 10,
    sort = { createdAt: -1 },
  } = options;

  return await Payment.find(query)
    .populate("customer")
    .populate("invoice")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

const countPayments = async (query) => {
  return await Payment.countDocuments(query);
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

        collected: {
          $sum: {
            $cond: [
              { $eq: ["$status", "PAID"] },
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