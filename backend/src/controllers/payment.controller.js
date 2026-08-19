import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import {
  createPayment as createPaymentService,
  getAllPayments as getAllPaymentsService,
  getPaymentById as getPaymentByIdService,
  updatePayment as updatePaymentService,
  updatePaymentStatus as updatePaymentStatusService,
  deletePayment as deletePaymentService,
  getPaymentStats as getPaymentStatsService,
} from "../services/payment.service.js";

// CREATE PAYMENT
const createPayment = asyncHandler(async (req, res) => {
  const payment = await createPaymentService(
    req.body,
    req.user
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      payment,
      "Payment recorded successfully."
    )
  );
});

// GET ALL PAYMENTS
const getAllPayments = asyncHandler(async (req, res) => {
  const {
    search,
    paymentMode,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const result = await getAllPaymentsService(
    req.user,
    {
      search,
      paymentMode,
      status,
      page: Number(page),
      limit: Number(limit),
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Payments fetched successfully."
    )
  );
});

// GET PAYMENT BY ID
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await getPaymentByIdService(
    req.params.paymentId,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      payment,
      "Payment fetched successfully."
    )
  );
});

// UPDATE PAYMENT
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await updatePaymentService(
    req.params.paymentId,
    req.body,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      payment,
      "Payment updated successfully."
    )
  );
});

// UPDATE PAYMENT STATUS
const updatePaymentStatus = asyncHandler(
  async (req, res) => {
    const payment =
      await updatePaymentStatusService(
        req.params.paymentId,
        req.body.status,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        payment,
        "Payment status updated successfully."
      )
    );
  }
);

// DELETE PAYMENT
const deletePayment = asyncHandler(async (req, res) => {
  await deletePaymentService(
    req.params.paymentId,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Payment deleted successfully."
    )
  );
});

// GET PAYMENT STATS
const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await getPaymentStatsService(
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Payment stats fetched successfully."
    )
  );
});

export {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentStats,
};