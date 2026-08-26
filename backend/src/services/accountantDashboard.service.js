import {
  getAccountantDashboardSummary,
  getAccountantRevenueTrend,
  getPaymentDistribution,
  getTopProducts,
  getRecentPayments,
  getRecentGSTTransactions,
  getRecentBankTransactions,
} from "../repositories/accountantDashboard.repository.js";

class AccountantDashboardService {

  // ==========================================
  // SUMMARY
  // ==========================================

  async getSummary(user) {
    return await getAccountantDashboardSummary(
      user.company
    );
  }


  // ==========================================
  // REVENUE TREND
  // ==========================================

  async getRevenueTrend(user) {
    const result =
      await getAccountantRevenueTrend(
        user.company
      );

    return result.map(
      (item) => ({
        year:
          item._id.year,

        month:
          item._id.month,

        revenue:
          item.revenue || 0,

        gstCollected:
          item.gstCollected || 0,
      })
    );
  }


  // ==========================================
  // PAYMENT DISTRIBUTION
  // ==========================================

  async getPaymentDistribution(user) {
    const result =
      await getPaymentDistribution(
        user.company
      );

    return result.map(
      (item) => ({
        mode:
          item._id ||
          "OTHER",

        amount:
          item.amount || 0,

        count:
          item.count || 0,
      })
    );
  }


  // ==========================================
  // TOP PRODUCTS
  // ==========================================

  async getTopProducts(user) {
    return await getTopProducts(
      user.company
    );
  }


  // ==========================================
  // RECENT ACTIVITY
  // ==========================================

  async getRecentActivity(user) {

    const [
      payments,
      gstTransactions,
      bankTransactions,
    ] = await Promise.all([

      getRecentPayments(
        user.company
      ),

      getRecentGSTTransactions(
        user.company
      ),

      getRecentBankTransactions(
        user.company
      ),
    ]);


    const activities = [];


    // PAYMENTS
    payments.forEach(
      (payment) => {

        activities.push({
          type: "PAYMENT",

          title:
            "Payment recorded",

          description:
            payment.paymentMode ||
            "Payment",

          amount:
            payment.amount || 0,

          date:
            payment.createdAt,
        });
      }
    );


    // GST
    gstTransactions.forEach(
      (transaction) => {

        activities.push({
          type: "GST",

          title:
            "GST entry recorded",

          description:
            transaction.documentNumber ||
            "",

          amount:
            transaction.totalTax ||
            0,

          date:
            transaction.createdAt,
        });
      }
    );


    // BANK
    bankTransactions.forEach(
      (transaction) => {

        activities.push({
          type: "BANK",

          title:
            "Bank transaction recorded",

          description:
            transaction.narration ||
            transaction.referenceNumber ||
            "",

          amount:
            transaction.amount || 0,

          date:
            transaction.createdAt,
        });
      }
    );


    return activities
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 10);
  }
}


export default new AccountantDashboardService();