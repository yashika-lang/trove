import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  getUserProfile as getUserProfileService,
} from "../services/profile.service.js";

// ======================================================
// GET MY PROFILE
// ======================================================

const getUserProfile = asyncHandler(
  async (req, res) => {

    const profile =
      await getUserProfileService(
        req.user._id
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          profile,
          "Profile fetched successfully."
        )
      );
  }
);

export {
  getUserProfile,
};