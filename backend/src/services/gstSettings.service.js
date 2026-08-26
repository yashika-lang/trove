import ApiError from "../exceptions/ApiError.js";

import {
  getGSTSettings,
  updateGSTSettings,
  deleteGSTSettings,
} from "../repositories/gstSettings.repository.js";

import { createGSTAuditLog } from "../repositories/gstAuditLog.repository.js";

class GSTSettingsService {
  // ==========================================
  // GET GST SETTINGS
  // ==========================================

  async getSettings(user) {
    return await getGSTSettings(
      user.company
    );
  }

  // ==========================================
  // CREATE / UPDATE GST SETTINGS
  // ==========================================

  async saveSettings(data, user) {
    const {
      legalName,
      gstin,
      stateCode,
      state,
      registrationType,
      filingFrequency,
      compositionScheme,
      eInvoicing,
      reverseCharge,
      autoReconcile2B,
      eInvoiceThreshold,
      eWayBillThreshold,
    } = data;

    // ----------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------

    if (!legalName?.trim()) {
      throw new ApiError(
        400,
        "Legal name is required."
      );
    }

    if (!gstin?.trim()) {
      throw new ApiError(
        400,
        "GSTIN is required."
      );
    }

    if (!stateCode?.trim()) {
      throw new ApiError(
        400,
        "State code is required."
      );
    }

    if (!state?.trim()) {
      throw new ApiError(
        400,
        "State is required."
      );
    }

    // ----------------------------------------
    // REGISTRATION TYPE
    // ----------------------------------------

    const allowedRegistrationTypes = [
      "REGULAR",
      "COMPOSITION",
      "CASUAL",
      "SEZ",
    ];

    if (
      !allowedRegistrationTypes.includes(
        registrationType
      )
    ) {
      throw new ApiError(
        400,
        "Invalid registration type."
      );
    }

    // ----------------------------------------
    // FILING FREQUENCY
    // ----------------------------------------

    const allowedFrequencies = [
      "MONTHLY",
      "QUARTERLY",
    ];

    if (
      !allowedFrequencies.includes(
        filingFrequency
      )
    ) {
      throw new ApiError(
        400,
        "Invalid filing frequency."
      );
    }

    // ----------------------------------------
    // GSTIN BASIC VALIDATION
    // ----------------------------------------

    const normalizedGSTIN =
      gstin
        .trim()
        .toUpperCase();

    if (
      normalizedGSTIN.length !== 15
    ) {
      throw new ApiError(
        400,
        "GSTIN must contain 15 characters."
      );
    }

    // ----------------------------------------
    // THRESHOLD VALIDATION
    // ----------------------------------------

    const invoiceThreshold =
      Number(
        eInvoiceThreshold || 0
      );

    const ewayThreshold =
      Number(
        eWayBillThreshold || 0
      );

    if (
      Number.isNaN(
        invoiceThreshold
      ) ||
      invoiceThreshold < 0
    ) {
      throw new ApiError(
        400,
        "Invalid e-invoice threshold."
      );
    }

    if (
      Number.isNaN(
        ewayThreshold
      ) ||
      ewayThreshold < 0
    ) {
      throw new ApiError(
        400,
        "Invalid e-way bill threshold."
      );
    }

    // ----------------------------------------
    // SAVE
    // ----------------------------------------

    const updated =
      await updateGSTSettings(
        user.company,
        {
          legalName:
            legalName.trim(),

          gstin:
            normalizedGSTIN,

          stateCode:
            stateCode.trim(),

          state:
            state.trim(),

          registrationType,

          filingFrequency,

          compositionScheme:
            Boolean(compositionScheme),

          eInvoicing:
            Boolean(eInvoicing),

          reverseCharge:
            Boolean(reverseCharge),

          autoReconcile2B:
            Boolean(autoReconcile2B),

          eInvoiceThreshold:
            invoiceThreshold,

          eWayBillThreshold:
            ewayThreshold,

          updatedBy:
            user._id,
        }
      );

    try {
      await createGSTAuditLog({
        action: "GST_SETTINGS_UPDATED",
        description: `GST settings updated by ${user.fullName || "user"}`,
        entityType: "GSTSettings",
        entityId: updated._id,
        performedBy: user._id,
        company: user.company,
      });
    } catch {
      // Never let audit logging block the save.
    }

    return updated;
  }

  // ==========================================
  // DELETE GST SETTINGS
  // ==========================================

  async deleteSettings(user) {
    const deleted =
      await deleteGSTSettings(
        user.company
      );

    if (!deleted) {
      throw new ApiError(
        404,
        "GST settings not found."
      );
    }

    return deleted;
  }
}

export default GSTSettingsService;