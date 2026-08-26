import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import HsnSacRepository from "../repositories/hsnSac.repository.js";
import { createGSTAuditLog } from "../repositories/gstAuditLog.repository.js";

class HsnSacService {
  constructor() {
    this.repository =
      new HsnSacRepository();
  }

  // ==========================================
  // CREATE HSN / SAC CODE
  // ==========================================

  async createHsnSac(data, user) {
    const {
      code,
      type,
      description,
      uqc,
      gstRate,
    } = data;

    if (!code?.trim()) {
      throw new ApiError(
        400,
        "HSN/SAC code is required."
      );
    }

    if (!["HSN", "SAC"].includes(type)) {
      throw new ApiError(
        400,
        "Type must be HSN or SAC."
      );
    }

    if (!description?.trim()) {
      throw new ApiError(
        400,
        "Description is required."
      );
    }

    const rate = Number(gstRate);

    if (
      Number.isNaN(rate) ||
      rate < 0
    ) {
      throw new ApiError(
        400,
        "Invalid GST rate."
      );
    }

    const existing =
      await this.repository.findAll({
        companyId: user.company,
        search: code.trim(),
        page: 1,
        limit: 100,
      });

    const duplicate =
      existing.entries.find(
        (entry) =>
          entry.code.toLowerCase() ===
          code.trim().toLowerCase()
      );

    if (duplicate) {
      throw new ApiError(
        409,
        "HSN/SAC code already exists."
      );
    }

    const created =
      await this.repository.create({
        code: code.trim(),
        type,
        description:
          description.trim(),
        uqc: uqc?.trim() || "",
        gstRate: rate,
        active: true,
        company: user.company,
        createdBy: user._id,
      });

    try {
      await createGSTAuditLog({
        action: "HSN_ADDED",
        description: `${type} ${code.trim()} added (${description.trim()}, ${rate}%)`,
        entityType: "HsnSac",
        entityId: created._id,
        performedBy: user._id,
        company: user.company,
      });
    } catch {
      // Never let audit logging block creation.
    }

    return created;
  }

  // ==========================================
  // GET HSN / SAC CODES
  // ==========================================

  async getHsnSacCodes(
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

    return await this.repository.findAll({
      companyId: user.company,
      search: filters.search,
      type: filters.type,
      page,
      limit,
    });
  }

  // ==========================================
  // GET HSN / SAC BY ID
  // ==========================================

  async getHsnSacById(
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
        "Invalid HSN/SAC ID."
      );
    }

    const entry =
      await this.repository.findById(
        entryId,
        user.company
      );

    if (!entry) {
      throw new ApiError(
        404,
        "HSN/SAC code not found."
      );
    }

    return entry;
  }

  // ==========================================
  // UPDATE HSN / SAC
  // ==========================================

  async updateHsnSac(
    entryId,
    data,
    user
  ) {
    await this.getHsnSacById(
      entryId,
      user
    );

    const updateData = {};

    if (data.code !== undefined) {
      if (!data.code.trim()) {
        throw new ApiError(
          400,
          "HSN/SAC code cannot be empty."
        );
      }

      updateData.code =
        data.code.trim();
    }

    if (data.type !== undefined) {
      if (
        !["HSN", "SAC"].includes(
          data.type
        )
      ) {
        throw new ApiError(
          400,
          "Type must be HSN or SAC."
        );
      }

      updateData.type =
        data.type;
    }

    if (
      data.description !==
      undefined
    ) {
      if (
        !data.description.trim()
      ) {
        throw new ApiError(
          400,
          "Description cannot be empty."
        );
      }

      updateData.description =
        data.description.trim();
    }

    if (data.uqc !== undefined) {
      updateData.uqc =
        data.uqc.trim();
    }

    if (
      data.gstRate !==
      undefined
    ) {
      const rate =
        Number(data.gstRate);

      if (
        Number.isNaN(rate) ||
        rate < 0
      ) {
        throw new ApiError(
          400,
          "Invalid GST rate."
        );
      }

      updateData.gstRate =
        rate;
    }

    if (
      data.active !==
      undefined
    ) {
      updateData.active =
        Boolean(data.active);
    }

    return await this.repository.update(
      entryId,
      user.company,
      updateData
    );
  }

  // ==========================================
  // DELETE HSN / SAC
  // ==========================================

  async deleteHsnSac(
    entryId,
    user
  ) {
    await this.getHsnSacById(
      entryId,
      user
    );

    const deleted =
      await this.repository.delete(
        entryId,
        user.company
      );

    if (!deleted) {
      throw new ApiError(
        404,
        "HSN/SAC code could not be deleted."
      );
    }

    return deleted;
  }
}

export default HsnSacService;