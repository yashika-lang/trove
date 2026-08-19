import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import ApiError from "../exceptions/ApiError.js";

import {
  importBankStatement as importBankStatementService,
} from "../services/bankImport.service.js";

const importBankStatement = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      400,
      "CSV file is required."
    );
  }

  const result = await importBankStatementService(
    req.file.buffer,
    req.body.bankAccount,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Bank statement imported successfully."
    )
  );
});

export {
  importBankStatement,
};