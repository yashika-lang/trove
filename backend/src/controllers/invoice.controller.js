import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import InvoiceService from "../services/invoice.service.js";

const invoiceService = new InvoiceService();

// CREATE DIRECT INVOICE
const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(
    req.body,
    req.user.company,
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      invoice,
      "Invoice created successfully."
    )
  );
});

// CREATE INVOICE FROM QUOTATION
const createInvoiceFromQuotation = asyncHandler(
  async (req, res) => {
    const invoice =
      await invoiceService.createInvoiceFromQuotation(
        req.params.quotationId,
        req.user.company,
        req.user._id,
        req.body.dueDate
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        invoice,
        "Invoice created from quotation successfully."
      )
    );
  }
);

// GET ALL INVOICES
const getAllInvoices = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const result =
    await invoiceService.getAllInvoices({
      companyId: req.user.company,
      search,
      status,
      page: Number(page),
      limit: Number(limit),
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        invoices: result.invoices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(
            result.total / Number(limit)
          ),
        },
      },
      "Invoices fetched successfully."
    )
  );
});

// GET INVOICE BY ID
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice =
    await invoiceService.getInvoiceById(
      req.params.invoiceId,
      req.user.company
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      invoice,
      "Invoice fetched successfully."
    )
  );
});

// UPDATE INVOICE
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice =
    await invoiceService.updateInvoice(
      req.params.invoiceId,
      req.user.company,
      req.body
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      invoice,
      "Invoice updated successfully."
    )
  );
});

// UPDATE INVOICE STATUS
const updateInvoiceStatus = asyncHandler(
  async (req, res) => {
    const invoice =
      await invoiceService.updateInvoiceStatus(
        req.params.invoiceId,
        req.user.company,
        req.body.status
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        invoice,
        "Invoice status updated successfully."
      )
    );
  }
);

// DELETE INVOICE
const deleteInvoice = asyncHandler(async (req, res) => {
  await invoiceService.deleteInvoice(
    req.params.invoiceId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Invoice deleted successfully."
    )
  );
});

// GET INVOICE STATS
const getInvoiceStats = asyncHandler(async (req, res) => {
  const stats =
    await invoiceService.getInvoiceStats(
      req.user.company
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Invoice stats fetched successfully."
    )
  );
});

export {
  createInvoice,
  createInvoiceFromQuotation,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceStats,
};