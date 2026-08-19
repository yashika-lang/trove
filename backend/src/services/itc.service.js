import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import {
  createITC,
  getITCEntries,
  getITCById,
  updateITC,
  deleteITC,
  getITCSummary,
} from "../repositories/itc.repository.js";


class ITCService {

  // ==========================================
  // CREATE ITC ENTRY
  // ==========================================

  async createITC(
    data,
    user
  ) {

    const {
      transaction,
      documentNumber,
      documentDate,
      supplierName,
      gstin,
      taxableAmount = 0,
      cgstAvailable = 0,
      sgstAvailable = 0,
      igstAvailable = 0,
      cessAvailable = 0,
      eligibility = "ELIGIBLE",
      claimStatus = "NOT_CLAIMED",
      claimed = 0,
      reversed = 0,
      notes,
    } = data;


    // ----------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------

    if (!documentNumber?.trim()) {
      throw new ApiError(
        400,
        "Document number is required."
      );
    }


    if (!supplierName?.trim()) {
      throw new ApiError(
        400,
        "Supplier name is required."
      );
    }


    if (!gstin?.trim()) {
      throw new ApiError(
        400,
        "GSTIN is required."
      );
    }


    // ----------------------------------------
    // VALIDATE TRANSACTION ID
    // ----------------------------------------

    if (transaction) {

      if (
        !mongoose.Types.ObjectId.isValid(
          transaction
        )
      ) {
        throw new ApiError(
          400,
          "Invalid GST transaction ID."
        );
      }
    }


    // ----------------------------------------
    // VALIDATE ELIGIBILITY
    // ----------------------------------------

    const allowedEligibility = [
      "ELIGIBLE",
      "INELIGIBLE",
      "PARTIAL",
    ];

    if (
      !allowedEligibility.includes(
        eligibility
      )
    ) {
      throw new ApiError(
        400,
        "Invalid ITC eligibility."
      );
    }


    // ----------------------------------------
    // VALIDATE CLAIM STATUS
    // ----------------------------------------

    const allowedClaimStatus = [
      "NOT_CLAIMED",
      "CLAIMED",
      "REVERSED",
    ];

    if (
      !allowedClaimStatus.includes(
        claimStatus
      )
    ) {
      throw new ApiError(
        400,
        "Invalid ITC claim status."
      );
    }


    // ----------------------------------------
    // NORMALIZE NUMBERS
    // ----------------------------------------

    const taxable =
      Number(taxableAmount) || 0;

    const cgst =
      Number(cgstAvailable) || 0;

    const sgst =
      Number(sgstAvailable) || 0;

    const igst =
      Number(igstAvailable) || 0;

    const cess =
      Number(cessAvailable) || 0;

    const claimedAmount =
      Number(claimed) || 0;

    const reversedAmount =
      Number(reversed) || 0;


    if (
      taxable < 0 ||
      cgst < 0 ||
      sgst < 0 ||
      igst < 0 ||
      cess < 0 ||
      claimedAmount < 0 ||
      reversedAmount < 0
    ) {
      throw new ApiError(
        400,
        "ITC amounts cannot be negative."
      );
    }


    // ----------------------------------------
    // DUPLICATE DOCUMENT CHECK
    // ----------------------------------------

    const existing =
      await getITCEntries(
        user.company,
        {
          search:
            documentNumber.trim(),
        },
        0,
        100
      );


    const duplicate =
      existing.entries.find(
        (entry) =>
          entry.documentNumber
            ?.toLowerCase() ===
          documentNumber
            .trim()
            .toLowerCase()
      );


    if (duplicate) {
      throw new ApiError(
        409,
        "ITC entry with this document number already exists."
      );
    }


    // ----------------------------------------
    // CREATE DATA
    // ----------------------------------------

    const itcData = {

      transaction:
        transaction || null,

      documentNumber:
        documentNumber.trim(),

      documentDate:
        documentDate || null,

      supplierName:
        supplierName.trim(),

      gstin:
        gstin
          .trim()
          .toUpperCase(),

      taxableAmount:
        taxable,

      cgstAvailable:
        cgst,

      sgstAvailable:
        sgst,

      igstAvailable:
        igst,

      cessAvailable:
        cess,

      eligibility,

      claimStatus,

      claimed:
        claimedAmount,

      reversed:
        reversedAmount,

      notes:
        notes?.trim() || "",

      company:
        user.company,

      createdBy:
        user._id,
    };


    return await createITC(
      itcData
    );
  }


  // ==========================================
  // GET ITC ENTRIES
  // ==========================================

  async getITCEntriesService(
    user,
    filters = {}
  ) {

    const page =
      Math.max(
        Number(filters.page) || 1,
        1
      );


    const limit =
      Math.min(
        Math.max(
          Number(filters.limit) || 20,
          1
        ),
        100
      );


    const skip =
      (page - 1) * limit;


    return await getITCEntries(
      user.company,
      filters,
      skip,
      limit
    );
  }


  // ==========================================
  // GET ITC BY ID
  // ==========================================

  async getITCByIdService(
    entryId,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        entryId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid ITC entry ID."
      );
    }


    const entry =
      await getITCById(
        entryId,
        user.company
      );


    if (!entry) {
      throw new ApiError(
        404,
        "ITC entry not found."
      );
    }


    return entry;
  }


  // ==========================================
  // UPDATE ITC
  // ==========================================

  async updateITCService(
    entryId,
    data,
    user
  ) {

    await this.getITCByIdService(
      entryId,
      user
    );


    const updateData = {};


    // ----------------------------------------
    // DOCUMENT NUMBER
    // ----------------------------------------

    if (
      data.documentNumber !== undefined
    ) {

      if (
        !data.documentNumber?.trim()
      ) {
        throw new ApiError(
          400,
          "Document number cannot be empty."
        );
      }


      updateData.documentNumber =
        data.documentNumber.trim();
    }


    // ----------------------------------------
    // DOCUMENT DATE
    // ----------------------------------------

    if (
      data.documentDate !== undefined
    ) {

      updateData.documentDate =
        data.documentDate;
    }


    // ----------------------------------------
    // SUPPLIER
    // ----------------------------------------

    if (
      data.supplierName !== undefined
    ) {

      if (
        !data.supplierName?.trim()
      ) {
        throw new ApiError(
          400,
          "Supplier name cannot be empty."
        );
      }


      updateData.supplierName =
        data.supplierName.trim();
    }


    // ----------------------------------------
    // GSTIN
    // ----------------------------------------

    if (
      data.gstin !== undefined
    ) {

      if (
        !data.gstin?.trim()
      ) {
        throw new ApiError(
          400,
          "GSTIN cannot be empty."
        );
      }


      updateData.gstin =
        data.gstin
          .trim()
          .toUpperCase();
    }


    // ----------------------------------------
    // ELIGIBILITY
    // ----------------------------------------

    if (
      data.eligibility !== undefined
    ) {

      const allowedEligibility = [
        "ELIGIBLE",
        "INELIGIBLE",
        "PARTIAL",
      ];


      if (
        !allowedEligibility.includes(
          data.eligibility
        )
      ) {
        throw new ApiError(
          400,
          "Invalid ITC eligibility."
        );
      }


      updateData.eligibility =
        data.eligibility;
    }


    // ----------------------------------------
    // CLAIM STATUS
    // ----------------------------------------

    if (
      data.claimStatus !== undefined
    ) {

      const allowedClaimStatus = [
        "NOT_CLAIMED",
        "CLAIMED",
        "REVERSED",
      ];


      if (
        !allowedClaimStatus.includes(
          data.claimStatus
        )
      ) {
        throw new ApiError(
          400,
          "Invalid ITC claim status."
        );
      }


      updateData.claimStatus =
        data.claimStatus;
    }


    // ----------------------------------------
    // NUMERIC FIELDS
    // ----------------------------------------

    const numericFields = [
      "taxableAmount",
      "cgstAvailable",
      "sgstAvailable",
      "igstAvailable",
      "cessAvailable",
      "claimed",
      "reversed",
    ];


    for (
      const field of numericFields
    ) {

      if (
        data[field] !== undefined
      ) {

        const value =
          Number(data[field]);


        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          throw new ApiError(
            400,
            `${field} must be a valid non-negative number.`
          );
        }


        updateData[field] =
          value;
      }
    }


    // ----------------------------------------
    // NOTES
    // ----------------------------------------

    if (
      data.notes !== undefined
    ) {

      updateData.notes =
        data.notes?.trim() || "";
    }


    // ----------------------------------------
    // UPDATE
    // ----------------------------------------

    const updated =
      await updateITC(
        entryId,
        user.company,
        updateData
      );


    if (!updated) {
      throw new ApiError(
        404,
        "ITC entry not found."
      );
    }


    return updated;
  }


  // ==========================================
  // DELETE ITC
  // ==========================================

  async deleteITCService(
    entryId,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        entryId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid ITC entry ID."
      );
    }


    const existing =
      await getITCById(
        entryId,
        user.company
      );


    if (!existing) {
      throw new ApiError(
        404,
        "ITC entry not found."
      );
    }


    const deleted =
      await deleteITC(
        entryId,
        user.company
      );


    if (!deleted) {
      throw new ApiError(
        404,
        "ITC entry could not be deleted."
      );
    }


    return deleted;
  }


  // ==========================================
  // ITC SUMMARY
  // ==========================================

  async getITCSummaryService(
    user
  ) {

    return await getITCSummary(
      user.company
    );
  }
}


// ==========================================
// SERVICE INSTANCE
// ==========================================

const itcService =
  new ITCService();


// ==========================================
// NAMED EXPORTS
// ==========================================

export {
  ITCService,

  itcService,

  createITC,

  getITCEntries,

  getITCById,

  updateITC,

  deleteITC,

  getITCSummary,
};


// ==========================================
// SERVICE FUNCTIONS
// ==========================================

export const createITCEntry =
  async (
    data,
    user
  ) => {

    return await itcService.createITC(
      data,
      user
    );
  };


export const getITCEntriesService =
  async (
    user,
    filters = {}
  ) => {

    return await itcService.getITCEntriesService(
      user,
      filters
    );
  };


export const getITCByIdService =
  async (
    entryId,
    user
  ) => {

    return await itcService.getITCByIdService(
      entryId,
      user
    );
  };


export const updateITCEntry =
  async (
    entryId,
    data,
    user
  ) => {

    return await itcService.updateITCService(
      entryId,
      data,
      user
    );
  };


export const deleteITCEntry =
  async (
    entryId,
    user
  ) => {

    return await itcService.deleteITCService(
      entryId,
      user
    );
  };


export const getITCSummaryService =
  async (
    user
  ) => {

    return await itcService.getITCSummaryService(
      user
    );
  };

export default ITCService;