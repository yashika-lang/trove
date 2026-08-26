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

import { createGSTAuditLog } from "../repositories/gstAuditLog.repository.js";
import { notificationService } from "./notification.service.js";
import GSTTransaction from "../models/gstTransaction.model.js";

// Mirrors ITC's own Mongoose enums exactly (itc.model.js) — the previous
// lists here ("INELIGIBLE"/"PARTIAL", "NOT_CLAIMED") don't exist on the
// schema at all, so any create/update using them would pass this
// service's own check and then crash with a Mongoose ValidationError.
const ALLOWED_ELIGIBILITY = [
  "ELIGIBLE",
  "BLOCKED",
  "PENDING",
];

const ALLOWED_CLAIM_STATUS = [
  "AVAILABLE",
  "CLAIMED",
  "PARTIALLY_CLAIMED",
  "REVERSED",
];


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
      eligibility = "PENDING",
      eligibilityReason,
      notes,
    } = data;


    // ----------------------------------------
    // TRANSACTION REQUIRED
    // ----------------------------------------
    //
    // ITC is only ever available/blocked/pending against a real inward
    // (purchase) GST transaction — the model itself requires this
    // reference. Rather than let the caller re-type a second, possibly
    // drifted set of document/supplier/tax figures, every ITC-relevant
    // field is derived straight from that transaction, so ITC math can
    // never disagree with the GST Transactions ledger it comes from.
    // ----------------------------------------

    if (
      !transaction ||
      !mongoose.Types.ObjectId.isValid(
        transaction
      )
    ) {
      throw new ApiError(
        400,
        "A valid inward GST transaction is required."
      );
    }


    const gstTransaction =
      await GSTTransaction.findOne({
        _id: transaction,
        company: user.company,
      }).lean();


    if (!gstTransaction) {
      throw new ApiError(
        404,
        "GST transaction not found."
      );
    }


    if (
      gstTransaction.type !== "INWARD"
    ) {
      throw new ApiError(
        400,
        "ITC can only be created for an inward (purchase) GST transaction."
      );
    }


    // ----------------------------------------
    // VALIDATE ELIGIBILITY
    // ----------------------------------------

    if (
      !ALLOWED_ELIGIBILITY.includes(
        eligibility
      )
    ) {
      throw new ApiError(
        400,
        "Invalid ITC eligibility."
      );
    }


    if (
      eligibility === "BLOCKED" &&
      !eligibilityReason?.trim()
    ) {
      throw new ApiError(
        400,
        "A reason is required when marking ITC as blocked."
      );
    }


    // ----------------------------------------
    // ONE ITC ENTRY PER TRANSACTION
    // ----------------------------------------

    const existingForTransaction =
      await getITCEntries(
        user.company,
        {
          search:
            gstTransaction.documentNumber,
        },
        0,
        100
      );


    const duplicate =
      existingForTransaction.entries.find(
        (entry) =>
          String(
            entry.transaction?._id ||
              entry.transaction
          ) === String(transaction)
      );


    if (duplicate) {
      throw new ApiError(
        409,
        "An ITC entry already exists for this GST transaction."
      );
    }


    // ----------------------------------------
    // CREATE DATA — tax figures derived from
    // the transaction, not re-entered
    // ----------------------------------------

    const itcData = {

      transaction:
        gstTransaction._id,

      documentNumber:
        gstTransaction.documentNumber,

      documentDate:
        gstTransaction.date,

      supplierName:
        gstTransaction.supplierName ||
        "Unknown Supplier",

      gstin:
        (gstTransaction.gstin || "")
          .toUpperCase(),

      taxableAmount:
        gstTransaction.taxableAmount || 0,

      cgstAvailable:
        gstTransaction.cgst || 0,

      sgstAvailable:
        gstTransaction.sgst || 0,

      igstAvailable:
        gstTransaction.igst || 0,

      cessAvailable:
        gstTransaction.cess || 0,

      eligibility,

      eligibilityReason:
        eligibilityReason?.trim() || "",

      claimStatus: "AVAILABLE",

      claimed: 0,

      reversed: 0,

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

  async getITCEntries(
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

  async getITCById(
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

    await this.getITCById(
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

      if (
        !ALLOWED_ELIGIBILITY.includes(
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

      if (
        !ALLOWED_CLAIM_STATUS.includes(
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
  // CLAIM ITC
  // ==========================================
  //
  // The credit-by-tax-head "Available" figure for an entry is the sum of
  // its four availability fields; claiming can never exceed what's left
  // after whatever has already been claimed or reversed.
  // ==========================================

  async claimITC(
    entryId,
    amount,
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

    if (entry.eligibility === "BLOCKED") {
      throw new ApiError(
        400,
        "Blocked ITC cannot be claimed."
      );
    }

    const claimAmount =
      Number(amount);

    if (
      Number.isNaN(claimAmount) ||
      claimAmount <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid claim amount."
      );
    }

    const totalAvailable =
      Number(entry.cgstAvailable || 0) +
      Number(entry.sgstAvailable || 0) +
      Number(entry.igstAvailable || 0) +
      Number(entry.cessAvailable || 0);

    const alreadyClaimed =
      Number(entry.claimed || 0);

    const remaining =
      totalAvailable - alreadyClaimed;

    if (claimAmount > remaining) {
      throw new ApiError(
        400,
        `Cannot claim more than the remaining available credit (₹${remaining}).`
      );
    }

    const newClaimed =
      alreadyClaimed + claimAmount;

    const claimStatus =
      newClaimed >= totalAvailable
        ? "CLAIMED"
        : "PARTIALLY_CLAIMED";

    const updated =
      await updateITC(
        entryId,
        user.company,
        {
          claimed: newClaimed,
          claimStatus,
        }
      );

    try {
      await createGSTAuditLog({
        action: "ITC_CLAIMED",
        description: `₹${claimAmount.toLocaleString("en-IN")} claimed on ${entry.documentNumber} (${entry.supplierName})`,
        entityType: "ITC",
        entityId: entry._id,
        metadata: { claimAmount, newClaimed, claimStatus },
        performedBy: user._id,
        company: user.company,
      });
    } catch {
      // Never let audit logging block the claim itself.
    }

    return updated;
  }


  // ==========================================
  // REVERSE ITC
  // ==========================================
  //
  // A reversal only ever applies against what's net-claimed so far
  // (claimed - reversed) — e.g. because the supplier's GSTR-1 wasn't
  // filed and the credit is no longer valid.
  // ==========================================

  async reverseITC(
    entryId,
    amount,
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

    const reverseAmount =
      Number(amount);

    if (
      Number.isNaN(reverseAmount) ||
      reverseAmount <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid reversal amount."
      );
    }

    const alreadyClaimed =
      Number(entry.claimed || 0);

    const alreadyReversed =
      Number(entry.reversed || 0);

    const netClaimed =
      alreadyClaimed - alreadyReversed;

    if (reverseAmount > netClaimed) {
      throw new ApiError(
        400,
        `Cannot reverse more than the net claimed amount (₹${netClaimed}).`
      );
    }

    const newReversed =
      alreadyReversed + reverseAmount;

    const claimStatus =
      newReversed >= alreadyClaimed
        ? "REVERSED"
        : entry.claimStatus;

    const updated =
      await updateITC(
        entryId,
        user.company,
        {
          reversed: newReversed,
          claimStatus,
        }
      );

    try {
      await createGSTAuditLog({
        action: "ITC_REVERSED",
        description: `₹${reverseAmount.toLocaleString("en-IN")} reversed on ${entry.documentNumber} (${entry.supplierName})`,
        entityType: "ITC",
        entityId: entry._id,
        metadata: { reverseAmount, newReversed, claimStatus },
        performedBy: user._id,
        company: user.company,
      });
    } catch {
      // Never let audit logging block the reversal itself.
    }

    await notificationService.notify({
      companyId: user.company,
      type: "ITC_REVERSED",
      title: `ITC reversed on ${entry.documentNumber}`,
      message: `₹${reverseAmount.toLocaleString("en-IN")} reversed · ${entry.supplierName}`,
      relatedId: entry._id,
    });

    return updated;
  }


  // ==========================================
  // ITC SUMMARY
  // ==========================================

  async getITCSummary(
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

    return await itcService.getITCEntries(
      user,
      filters
    );
  };


export const getITCByIdService =
  async (
    entryId,
    user
  ) => {

    return await itcService.getITCById(
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

    return await itcService.getITCSummary(
      user
    );
  };

export default ITCService;