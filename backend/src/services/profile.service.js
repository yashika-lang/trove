import ApiError from "../exceptions/ApiError.js";

import {
  getProfileRepository,
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
    },


    role:
      user.role,

    metrics,

    quotationConversion,

    recentCustomers,

    recentActivity,

  };
};


export {
  getUserProfile,
};