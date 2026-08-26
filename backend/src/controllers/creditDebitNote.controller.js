import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import CreditDebitNoteService from "../services/creditDebitNote.service.js";

const service = new CreditDebitNoteService();

const createNote = asyncHandler(async (req, res) => {
  const { invoiceId, type, reason, items } = req.body;

  const note = await service.create(
    { invoiceId, type, reason, items },
    req.user.company,
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(201, note, `${type === "CREDIT_NOTE" ? "Credit" : "Debit"} note created successfully.`)
  );
});

const getNotes = asyncHandler(async (req, res) => {
  const { invoice, type, page = 1, limit = 10 } = req.query;

  const result = await service.getAll({
    companyId: req.user.company,
    invoice,
    type,
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notes: result.notes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / Number(limit)),
        },
      },
      "Notes fetched successfully."
    )
  );
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await service.getById(req.params.noteId, req.user.company);

  return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully."));
});

export { createNote, getNotes, getNoteById };
