import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import {
  createGSTReturn,
  getGSTReturns,
  getGSTReturnById,
  updateGSTReturn,
  getGSTReturnStats,
} from "../repositories/gstReturn.repository.js";

class GSTReturnService {
  // ==========================================
  // CREATE RETURN
  // ==========================================

  async createReturn(
    data,
    user
  ) {
    const {
      returnType,
      period,
      dueDate,
      liability = 0,
    } = data;

    if (
      ![
        "GSTR-1",
        "GSTR-3B",
        "GSTR-9",
      ].includes(returnType)
    ) {
      throw new ApiError(
        400,
        "Invalid GST return type."
      );
    }

    if (!period?.trim()) {
      throw new ApiError(
        400,
        "Return period is required."
      );
    }

    if (!dueDate) {
      throw new ApiError(
        400,
        "Due date is required."
      );
    }

    const amount =
      Number(liability);

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      throw new ApiError(
        400,
        "Invalid return liability."
      );
    }

    return await createGSTReturn({
      returnType,
      period: period.trim(),
      dueDate,
      liability: amount,
      status: "DRAFT",
      company: user.company,
      preparedBy: user._id,
    });
  }

  // ==========================================
  // GET RETURNS
  // ==========================================

  async getReturns(
    user,
    filters = {}
  ) {
    return await getGSTReturns(
      user.company,
      filters
    );
  }

  // ==========================================
  // GET RETURN BY ID
  // ==========================================

  async getReturnById(
    returnId,
    user
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        returnId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid GST return ID."
      );
    }

    const result =
      await getGSTReturnById(
        returnId,
        user.company
      );

    if (!result) {
      throw new ApiError(
        404,
        "GST return not found."
      );
    }

    return result;
  }

  // ==========================================
  // UPDATE RETURN
  // ==========================================

  async updateReturn(
    returnId,
    data,
    user
  ) {
    const existing =
      await this.getReturnById(
        returnId,
        user
      );

    if (
      ["FILED", "PAID"].includes(
        existing.status
      )
    ) {
      throw new ApiError(
        400,
        "Filed or paid returns cannot be modified."
      );
    }

    const updateData = {};

    if (data.returnType) {
      if (
        ![
          "GSTR-1",
          "GSTR-3B",
          "GSTR-9",
        ].includes(data.returnType)
      ) {
        throw new ApiError(
          400,
          "Invalid GST return type."
        );
      }

      updateData.returnType =
        data.returnType;
    }

    if (data.period !== undefined) {
      updateData.period =
        data.period.trim();
    }

    if (data.dueDate !== undefined) {
      updateData.dueDate =
        data.dueDate;
    }

    if (
      data.liability !== undefined
    ) {
      const liability =
        Number(data.liability);

      if (
        Number.isNaN(liability) ||
        liability < 0
      ) {
        throw new ApiError(
          400,
          "Invalid liability."
        );
      }

      updateData.liability =
        liability;
    }

    if (data.status) {
      const allowed = [
        "DRAFT",
        "PREPARED",
        "APPROVED",
        "FILED",
        "PAID",
        "PENDING",
      ];

      if (
        !allowed.includes(
          data.status
        )
      ) {
        throw new ApiError(
          400,
          "Invalid GST return status."
        );
      }

      updateData.status =
        data.status;

      if (
        data.status === "FILED"
      ) {
        updateData.filedAt =
          new Date();
      }
    }

    if (
      data.filingReference !==
      undefined
    ) {
      updateData.filingReference =
        data.filingReference.trim();
    }

    return await updateGSTReturn(
      returnId,
      user.company,
      updateData
    );
  }

  // ==========================================
  // STATS
  // ==========================================

  async getStats(user) {
    return await getGSTReturnStats(
      user.company
    );
  }
}

export default GSTReturnService;