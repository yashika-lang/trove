import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import GSTSettingsService from "../services/gstSettings.service.js";

const service =
  new GSTSettingsService();


// ==========================================
// GET GST SETTINGS
// ==========================================

const getGSTSettingsController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getSettings(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST settings fetched successfully."
      )
    );
  });


// ==========================================
// SAVE GST SETTINGS
// ==========================================

const saveGSTSettingsController =
  asyncHandler(async (req, res) => {

    const result =
      await service.saveSettings(
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST settings saved successfully."
      )
    );
  });


// ==========================================
// DELETE GST SETTINGS
// ==========================================

const deleteGSTSettingsController =
  asyncHandler(async (req, res) => {

    const result =
      await service.deleteSettings(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST settings deleted successfully."
      )
    );
  });


export {
  getGSTSettingsController,
  saveGSTSettingsController,
  deleteGSTSettingsController,
};