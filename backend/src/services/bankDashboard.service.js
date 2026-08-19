import ApiError from "../exceptions/ApiError.js";

import {
  getBankDashboardData,
} from "../repositories/bankDashboard.repository.js";


// ==========================================
// GET BANK DASHBOARD
// ==========================================

const getBankDashboardService = async (
  user,
  filters = {}
) => {

  // ----------------------------------------
  // VALIDATE COMPANY
  // ----------------------------------------

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ========================================
  // VALIDATE TYPE
  // ========================================

  if (
    filters.type &&
    !["CREDIT", "DEBIT"].includes(
      filters.type
    )
  ) {
    throw new ApiError(
      400,
      "Transaction type must be CREDIT or DEBIT."
    );
  }


  // ========================================
  // VALIDATE RECONCILIATION STATUS
  // ========================================

  if (
    filters.reconciliationStatus &&
    ![
      "RECONCILED",
      "UNRECONCILED",
    ].includes(
      filters.reconciliationStatus
    )
  ) {
    throw new ApiError(
      400,
      "Invalid reconciliation status."
    );
  }


  // ========================================
  // DATE RANGE
  // ========================================

  let startOfDay;
  let endOfDay;


  if (
    filters.startDate ||
    filters.endDate
  ) {

    // --------------------------------------
    // START DATE
    // --------------------------------------

    if (filters.startDate) {

      startOfDay =
        new Date(
          filters.startDate
        );


      if (
        Number.isNaN(
          startOfDay.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid start date."
        );
      }


      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

    } else {

      startOfDay =
        new Date(0);
    }


    // --------------------------------------
    // END DATE
    // --------------------------------------

    if (filters.endDate) {

      endOfDay =
        new Date(
          filters.endDate
        );


      if (
        Number.isNaN(
          endOfDay.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid end date."
        );
      }


      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

    } else {

      endOfDay =
        new Date();
    }


    // --------------------------------------
    // INVALID DATE RANGE
    // --------------------------------------

    if (
      startOfDay >
      endOfDay
    ) {
      throw new ApiError(
        400,
        "Start date cannot be after end date."
      );
    }

  } else {

    // --------------------------------------
    // DEFAULT = TODAY
    // --------------------------------------

    startOfDay =
      new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );


    endOfDay =
      new Date();

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );
  }


  // ========================================
  // FETCH DASHBOARD DATA
  // ========================================

  const dashboard =
    await getBankDashboardData(
      user.company,
      startOfDay,
      endOfDay,
      filters
    );


  // ========================================
  // RETURN
  // ========================================

  return dashboard;
};


export {
  getBankDashboardService,
};