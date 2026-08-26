import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import ApiError from "../exceptions/ApiError.js";
import { search } from "../services/search.service.js";

const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    throw new ApiError(400, "Search query is required.");
  }

  const results = await search(req.user, q.trim());

  return res.status(200).json(
    new ApiResponse(200, results, "Search results fetched successfully.")
  );
});

export { globalSearch };
