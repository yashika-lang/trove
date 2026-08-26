import ApiError from "../exceptions/ApiError.js";

import {
  getProfileRepository,
  updateProfileRepository,
  getSalesMetricsRepository,
  getQuotationConversionRepository,
  getRecentCustomersRepository,
  getAccountantMetricsRepository,
  getAdminMetricsRepository,
  getRecentActivityRepository,
} from "../repositories/profile.repository.js";


// ======================================================
// DATE RANGE
// ======================================================

const getTodayRange = () => {

  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  return {
    start,
    end,
  };
};


// ======================================================
// GET PROFILE
// ======================================================

const getUserProfile = async (
  userId
) => {

  if (!userId) {
    throw new ApiError(
      400,
      "User ID is required."
    );
  }


  // ------------------------------------------
  // BASIC USER PROFILE
  // ------------------------------------------

  const user =
    await getProfileRepository(
      userId
    );


  if (!user) {
    throw new ApiError(
      404,
      "User profile not found."
    );
  }


  // ------------------------------------------
  // COMPANY
  // ------------------------------------------

  const companyId =
    user.company?._id;


  if (!companyId) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ------------------------------------------
  // ROLE
  // ------------------------------------------

  const role =
    String(user.role || "")
      .toLowerCase();


  const {
    start,
    end,
  } = getTodayRange();


  let metrics = {};

  let recentCustomers = [];

  let recentActivity = [];

  let quotationConversion = null;


  // ====================================================
  // SALES
  // ====================================================

  if (role === "sales") {

    metrics =
      await getSalesMetricsRepository(
        companyId,
        start,
        end
      );


    quotationConversion =
      await getQuotationConversionRepository(
        companyId
      );


    recentCustomers =
      await getRecentCustomersRepository(
        companyId,
        5
      );
  }


  // ====================================================
  // ACCOUNTANT
  // ====================================================

  else if (role === "accountant") {

    metrics =
      await getAccountantMetricsRepository(
        companyId
      );


    recentActivity =
      await getRecentActivityRepository(
        companyId,
        5
      );
  }


  // ====================================================
  // ADMIN
  // ====================================================

  else if (role === "admin") {

    metrics =
      await getAdminMetricsRepository(
        companyId
      );


    recentActivity =
      await getRecentActivityRepository(
        companyId,
        5
      );
  }


  // ====================================================
  // UNKNOWN ROLE
  // ====================================================

  else {

    throw new ApiError(
      403,
      "Unsupported user role."
    );
  }


  // ====================================================
  // RESPONSE
  // ====================================================

  return {

    user: {

      id:
        user._id,

      // Profile fields
      name:
        user.fullName || null,

      fullName:
        user.fullName || null,

      email:
        user.email,

      phone:
        user.phone,

      role:
        user.role,

      department:
        user.department || null,

      country:
        user.country,

      state:
        user.state,

      company: {

        id:
          user.company?._id,

        name:
          user.company?.companyName ||
          "",
      },

      // createdAt acts as Join Date
      joinDate:
        user.createdAt || null,

      // Updated whenever login succeeds
      lastLogin:
        user.lastLogin || null,

      preferences:
        user.preferences || {},
    },


    role:
      user.role,

    metrics,

    quotationConversion,

    recentCustomers,

    recentActivity,

  };
};


// ======================================================
// UPDATE PROFILE
// ======================================================
// Only the fields shown as editable on the Profile page — full name,
// phone, department. Role, email and company are never accepted here.

const updateUserProfile = async (
  userId,
  data
) => {

  if (!userId) {
    throw new ApiError(
      400,
      "User ID is required."
    );
  }

  const updateData = {};

  if (data.fullName !== undefined) {

    if (!data.fullName?.trim()) {
      throw new ApiError(
        400,
        "Full name cannot be empty."
      );
    }

    updateData.fullName =
      data.fullName.trim();
  }

  if (data.phone !== undefined) {

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(data.phone)) {
      throw new ApiError(
        400,
        "Please enter a valid 10-digit phone number."
      );
    }

    updateData.phone = data.phone;
  }

  if (data.department !== undefined) {
    updateData.department =
      data.department?.trim() || null;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(
      400,
      "No valid fields to update."
    );
  }

  const updated =
    await updateProfileRepository(
      userId,
      updateData
    );

  if (!updated) {
    throw new ApiError(
      404,
      "User profile not found."
    );
  }

  return {
    id: updated._id,
    name: updated.fullName || null,
    fullName: updated.fullName || null,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    department: updated.department || null,
    country: updated.country,
    state: updated.state,
    company: {
      id: updated.company?._id,
      name: updated.company?.companyName || "",
    },
    joinDate: updated.createdAt || null,
    lastLogin: updated.lastLogin || null,
  };
};


// ======================================================
// UPDATE MY PREFERENCES
// ======================================================
// Mirrors user.model.js's `preferences` sub-schema exactly — every field
// here is validated against the same enums the schema itself enforces.

const THEME_VALUES = ["light", "dark", "system"];
const DATE_FORMAT_VALUES = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const NUMBER_FORMAT_VALUES = ["1,000.00", "1.000,00", "1 000.00"];
const TIME_FORMAT_VALUES = ["12", "24"];

const updateUserPreferences = async (
  userId,
  data
) => {

  if (!userId) {
    throw new ApiError(
      400,
      "User ID is required."
    );
  }

  const updateData = {};

  if (data.theme !== undefined) {
    if (!THEME_VALUES.includes(data.theme)) {
      throw new ApiError(400, "Invalid theme.");
    }
    updateData["preferences.theme"] = data.theme;
  }

  if (data.language !== undefined) {
    if (!data.language?.trim()) {
      throw new ApiError(400, "Language cannot be empty.");
    }
    updateData["preferences.language"] = data.language.trim();
  }

  if (data.currency !== undefined) {
    if (!data.currency?.trim()) {
      throw new ApiError(400, "Currency cannot be empty.");
    }
    updateData["preferences.currency"] = data.currency.trim().toUpperCase();
  }

  if (data.dateFormat !== undefined) {
    if (!DATE_FORMAT_VALUES.includes(data.dateFormat)) {
      throw new ApiError(400, "Invalid date format.");
    }
    updateData["preferences.dateFormat"] = data.dateFormat;
  }

  if (data.numberFormat !== undefined) {
    if (!NUMBER_FORMAT_VALUES.includes(data.numberFormat)) {
      throw new ApiError(400, "Invalid number format.");
    }
    updateData["preferences.numberFormat"] = data.numberFormat;
  }

  if (data.timeFormat !== undefined) {
    if (!TIME_FORMAT_VALUES.includes(data.timeFormat)) {
      throw new ApiError(400, "Invalid time format.");
    }
    updateData["preferences.timeFormat"] = data.timeFormat;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(
      400,
      "No valid preference fields to update."
    );
  }

  const updated =
    await updateProfileRepository(
      userId,
      updateData
    );

  if (!updated) {
    throw new ApiError(
      404,
      "User profile not found."
    );
  }

  return updated.preferences;
};


export {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
};