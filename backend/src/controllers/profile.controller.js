import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  getUserProfile as getUserProfileService,
  updateUserProfile as updateUserProfileService,
  updateUserPreferences as updateUserPreferencesService,
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


// ======================================================
// UPDATE MY PROFILE
// ======================================================

const updateUserProfile = asyncHandler(
  async (req, res) => {

    const profile =
      await updateUserProfileService(
        req.user._id,
        req.body
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          profile,
          "Profile updated successfully."
        )
      );
  }
);

// ======================================================
// UPDATE MY PREFERENCES
// ======================================================

const updateUserPreferences = asyncHandler(
  async (req, res) => {

    const preferences =
      await updateUserPreferencesService(
        req.user._id,
        req.body
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          preferences,
          "Preferences updated successfully."
        )
      );
  }
);

export {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
};