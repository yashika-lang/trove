import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import {
  getGSTReconciliationTransactions,
  getGSTReconciliationTransactionById,
  updateGSTReconciliationStatus,
  getGSTReconciliationStats,
  createGSTReconciliation,
  getGSTReconciliationById,
  getGSTReconciliations,
  updateGSTReconciliation,
  getReconciliationRecordStats,
} from "../repositories/gstReconciliation.repository.js";

import GSTTransactionModel from "../models/gstTransaction.model.js";
import { createGSTAuditLog } from "../repositories/gstAuditLog.repository.js";
import { notificationService } from "./notification.service.js";


class GSTReconciliationService {

  // ==========================================
  // GET GST TRANSACTIONS
  // ==========================================

  async getTransactions(
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

    return await getGSTReconciliationTransactions(
      user.company,
      filters,
      (page - 1) * limit,
      limit
    );
  }


  // ==========================================
  // GET RECONCILIATION STATS
  // ==========================================

  async getStats(user) {

    return await getGSTReconciliationStats(
      user.company
    );
  }


  // ==========================================
  // GET GST TRANSACTION BY ID
  // ==========================================

  async getById(
    transactionId,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        transactionId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid GST transaction ID."
      );
    }

    const transaction =
      await getGSTReconciliationTransactionById(
        transactionId,
        user.company
      );

    if (!transaction) {
      throw new ApiError(
        404,
        "GST reconciliation transaction not found."
      );
    }

    return transaction;
  }


  // ==========================================
  // MARK TRANSACTION AS MATCHED
  // ==========================================

  async markMatched(
    transactionId,
    user
  ) {

    await this.getById(
      transactionId,
      user
    );

    return await updateGSTReconciliationStatus(
      transactionId,
      user.company,
      {
        reconciliationStatus:
          "MATCHED",

        reconciliationDifference:
          0,
      }
    );
  }


  // ==========================================
  // MARK TRANSACTION AS MISMATCH
  // ==========================================

  async markMismatch(
    transactionId,
    user,
    difference = 0
  ) {

    await this.getById(
      transactionId,
      user
    );

    const normalizedDifference =
      Number(difference) || 0;

    return await updateGSTReconciliationStatus(
      transactionId,
      user.company,
      {
        reconciliationStatus:
          "MISMATCH",

        reconciliationDifference:
          normalizedDifference,
      }
    );
  }


  // ==========================================
  // CREATE RECONCILIATION RECORD
  // ==========================================

  async createRecord(
    data,
    user
  ) {

    const {
      documentNumber,
      supplierName,
      gstin,
      period,

      booksTaxableAmount = 0,
      portalTaxableAmount = 0,

      booksTax: rawBooksTax = 0,
      portalTax: rawPortalTax = 0,

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

    if (!period?.trim()) {
      throw new ApiError(
        400,
        "GST period is required."
      );
    }


    // ----------------------------------------
    // NORMALIZE TAXABLE AMOUNTS
    // ----------------------------------------

    const normalizedBooksTaxableAmount =
      Number(
        booksTaxableAmount
      ) || 0;

    const normalizedPortalTaxableAmount =
      Number(
        portalTaxableAmount
      ) || 0;


    // ----------------------------------------
    // NORMALIZE TAX
    // ----------------------------------------

    const booksTax =
      Number(rawBooksTax) || 0;

    const portalTax =
      Number(rawPortalTax) || 0;


    // ----------------------------------------
    // CALCULATE DIFFERENCE
    // ----------------------------------------

    const difference =
      booksTax - portalTax;


    // ----------------------------------------
    // DETERMINE STATUS
    // ----------------------------------------

    let status = "MATCHED";


    // Nothing exists in books
    // but exists in GSTR-2B

    if (
      normalizedBooksTaxableAmount === 0 &&
      normalizedPortalTaxableAmount > 0
    ) {

      status =
        "MISSING_IN_BOOKS";

    }


    // Exists in books
    // but missing from GSTR-2B

    else if (
      normalizedPortalTaxableAmount === 0 &&
      normalizedBooksTaxableAmount > 0
    ) {

      status =
        "MISSING_IN_2B";

    }


    // Tax amount does not match

    else if (
      Math.abs(difference) > 0.01
    ) {

      status =
        "VALUE_MISMATCH";

    }


    // ----------------------------------------
    // CREATE RECONCILIATION
    // ----------------------------------------

    const created = await createGSTReconciliation({

      documentNumber:
        documentNumber.trim(),

      supplierName:
        supplierName.trim(),

      gstin:
        gstin
          ?.trim()
          .toUpperCase() || "",

      period:
        period.trim(),

      booksTaxableAmount:
        normalizedBooksTaxableAmount,

      portalTaxableAmount:
        normalizedPortalTaxableAmount,

      booksTax,

      portalTax,

      difference,

      status,

      matchedAt:
        status === "MATCHED"
          ? new Date()
          : null,

      notes:
        notes?.trim() || "",

      company:
        user.company,

      createdBy:
        user._id,
    });

    if (status !== "MATCHED") {
      await notificationService.notify({
        companyId: user.company,
        type: "RECONCILIATION_MISMATCH",
        title: `Reconciliation ${status.replace(/_/g, " ").toLowerCase()}: ${created.documentNumber}`,
        message: `${created.supplierName} · ${created.period} · ₹${Math.abs(difference).toLocaleString("en-IN")} difference`,
        relatedId: created._id,
      });
    }

    return created;
  }


  // ==========================================
  // GET RECONCILIATION RECORDS
  // ==========================================

  async getRecords(
    user,
    filters = {}
  ) {

    return await getGSTReconciliations(
      user.company,
      filters
    );
  }


  // ==========================================
  // GET RECONCILIATION RECORD BY ID
  // ==========================================

  async getRecordById(
    reconciliationId,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        reconciliationId
      )
    ) {

      throw new ApiError(
        400,
        "Invalid reconciliation ID."
      );
    }


    const record =
      await getGSTReconciliationById(
        reconciliationId,
        user.company
      );


    if (!record) {

      throw new ApiError(
        404,
        "GST reconciliation record not found."
      );
    }


    return record;
  }


  // ==========================================
  // UPDATE RECONCILIATION RECORD
  // ==========================================

  async updateRecord(
    reconciliationId,
    data,
    user
  ) {

    await this.getRecordById(
      reconciliationId,
      user
    );


    return await updateGSTReconciliation(
      reconciliationId,
      user.company,
      data
    );
  }


  // ==========================================
  // RECORD STATS
  // ==========================================
  //
  // Matches the reference UI's cards exactly: Matched / Value mismatch /
  // Missing in books / Missing in 2B, counted from real
  // GSTReconciliation records.
  // ==========================================

  async getRecordStats(
    user,
    filters = {}
  ) {

    return await getReconciliationRecordStats(
      user.company,
      filters
    );
  }


  // ==========================================
  // RE-RUN MATCH
  // ==========================================
  //
  // Refreshes each reconciliation record's "Books" side from the real,
  // current inward GST transaction it corresponds to (matched by
  // documentNumber) and recomputes status/difference — useful when a
  // transaction was edited or added after the reconciliation record was
  // first created. There is no external GSTN portal integration in this
  // app, so the "Portal 2B" side is never invented here; it stays
  // whatever was last entered against that record.
  // ==========================================

  async rerunMatch(
    user,
    filters = {}
  ) {

    const records =
      await getGSTReconciliations(
        user.company,
        filters
      );

    let updatedCount = 0;

    for (const record of records) {

      const liveTransaction =
        await GSTTransactionModel.findOne({
          company: user.company,
          type: "INWARD",
          documentNumber:
            record.documentNumber,
        }).lean();

      const booksTaxableAmount =
        liveTransaction?.taxableAmount || 0;

      const booksTax =
        liveTransaction?.totalTax || 0;

      const portalTaxableAmount =
        Number(record.portalTaxableAmount || 0);

      const portalTax =
        Number(record.portalTax || 0);

      const difference =
        booksTax - portalTax;

      let status = "MATCHED";

      if (
        booksTaxableAmount === 0 &&
        portalTaxableAmount > 0
      ) {
        status = "MISSING_IN_BOOKS";
      } else if (
        portalTaxableAmount === 0 &&
        booksTaxableAmount > 0
      ) {
        status = "MISSING_IN_2B";
      } else if (
        Math.abs(difference) > 0.01
      ) {
        status = "VALUE_MISMATCH";
      }

      const changed =
        record.booksTaxableAmount !== booksTaxableAmount ||
        record.booksTax !== booksTax ||
        record.status !== status;

      if (changed) {

        await updateGSTReconciliation(
          record._id,
          user.company,
          {
            booksTaxableAmount,
            booksTax,
            difference,
            status,
            matchedAt:
              status === "MATCHED"
                ? new Date()
                : null,
          }
        );

        updatedCount += 1;

        if (status !== "MATCHED" && record.status !== status) {
          await notificationService.notify({
            companyId: user.company,
            type: "RECONCILIATION_MISMATCH",
            title: `Reconciliation ${status.replace(/_/g, " ").toLowerCase()}: ${record.documentNumber}`,
            message: `${record.supplierName} · ${record.period} · ₹${Math.abs(difference).toLocaleString("en-IN")} difference`,
            relatedId: record._id,
          });
        }
      }
    }

    try {
      await createGSTAuditLog({
        action: "RECONCILIATION_RUN",
        description: `Re-run match: ${records.length} record(s) checked, ${updatedCount} updated${filters.period ? ` for ${filters.period}` : ""}`,
        entityType: "GSTReconciliation",
        metadata: { checked: records.length, updated: updatedCount, period: filters.period || null },
        performedBy: user._id,
        company: user.company,
      });
    } catch {
      // Never let audit logging block the re-run.
    }

    return {
      checked: records.length,
      updated: updatedCount,
    };
  }

}


export default GSTReconciliationService;