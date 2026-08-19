import {
  getDashboardSummary,
  getRevenueTrend,
  getPaymentDistribution,
  getTopProducts,
  getRecentActivity,
} from "../repositories/dashboard.repository.js";

class DashboardService {
  // ==========================================
  // SUMMARY
  // ==========================================

  async getSummary(user) {
    return await getDashboardSummary(
      user.company
    );
  }

  // ==========================================
  // REVENUE TREND
  // ==========================================

  async getRevenueTrend(user) {
    return await getRevenueTrend(
      user.company
    );
  }

  // ==========================================
  // PAYMENT DISTRIBUTION
  // ==========================================

  async getPaymentDistribution(user) {
    return await getPaymentDistribution(
      user.company
    );
  }

  // ==========================================
  // TOP PRODUCTS
  // ==========================================

  async getTopProducts(
    user,
    limit = 5
  ) {
    const safeLimit = Math.min(
      Math.max(
        Number(limit) || 5,
        1
      ),
      20
    );

    return await getTopProducts(
      user.company,
      safeLimit
    );
  }

  // ==========================================
  // RECENT ACTIVITY
  // ==========================================

  async getRecentActivity(
    user,
    limit = 10
  ) {
    const safeLimit = Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      50
    );

    return await getRecentActivity(
      user.company,
      safeLimit
    );
  }

  // ==========================================
  // COMPLETE DASHBOARD
  // ==========================================

  async getDashboard(user) {
    const [
      summary,
      revenueTrend,
      paymentDistribution,
      topProducts,
      recentActivity,
    ] = await Promise.all([
      this.getSummary(user),
      this.getRevenueTrend(user),
      this.getPaymentDistribution(user),
      this.getTopProducts(user, 5),
      this.getRecentActivity(user, 10),
    ]);

    return {
      summary,
      revenueTrend,
      paymentDistribution,
      topProducts,
      recentActivity,
    };
  }
}

export default DashboardService;