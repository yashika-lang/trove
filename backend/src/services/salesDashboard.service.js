import {
  getSalesDashboardSummary,
  getMonthlySalesPerformance,
  getSalesFollowUps,
  getSalesRecentCustomers,
  getSalesRecentInvoices,
  getSalesRecentQuotations,
  getSalesRecentPayments,
} from "../repositories/salesDashboard.repository.js";

class SalesDashboardService {

  // ==========================================
  // SUMMARY
  // ==========================================

  async getSummary(user) {
    return await getSalesDashboardSummary(
      user.company,
      user._id
    );
  }


  // ==========================================
  // MONTHLY PERFORMANCE
  // ==========================================

  async getMonthlyPerformance(user) {
    return await getMonthlySalesPerformance(
      user.company,
      user._id
    );
  }


  // ==========================================
  // FOLLOW UPS
  // ==========================================

  async getFollowUps(user) {
    const invoices =
      await getSalesFollowUps(
        user.company,
        user._id
      );

    return invoices.map(
      (invoice) => ({
        invoiceId:
          invoice._id,

        invoiceNumber:
          invoice.invoiceNumber,

        customer:
          invoice.customer?.name ||
          "Customer",

        dueDate:
          invoice.dueDate,

        amount:
          Math.max(
            0,
            (invoice.total || 0) -
              (invoice.paidAmount || 0)
          ),

        status:
          invoice.status,
      })
    );
  }


  // ==========================================
  // RECENT CUSTOMERS
  // ==========================================

  async getRecentCustomers(user) {
    return await getSalesRecentCustomers(
      user.company,
      user._id
    );
  }


  // ==========================================
  // ACTIVITY
  // ==========================================

  async getActivity(user) {
    const [
      invoices,
      quotations,
      payments,
    ] = await Promise.all([

      getSalesRecentInvoices(
        user.company,
        user._id
      ),

      getSalesRecentQuotations(
        user.company,
        user._id
      ),

      getSalesRecentPayments(
        user.company,
        user._id
      ),
    ]);

    const activity = [];


    invoices.forEach(
      (invoice) => {
        activity.push({
          type: "INVOICE",

          title:
            `Invoice ${
              invoice.invoiceNumber || ""
            } created`,

          description:
            invoice.customer?.name ||
            "Customer",

          amount:
            invoice.total || 0,

          date:
            invoice.createdAt,
        });
      }
    );


    quotations.forEach(
      (quotation) => {
        activity.push({
          type: "QUOTATION",

          title:
            `Quotation ${
              quotation.quotationNumber ||
              ""
            } ${
              quotation.status === "SENT"
                ? "sent"
                : "created"
            }`,

          description:
            quotation.customer?.name ||
            "Customer",

          amount:
            quotation.total || 0,

          date:
            quotation.createdAt,
        });
      }
    );


    payments.forEach(
      (payment) => {
        activity.push({
          type: "PAYMENT",

          title:
            "Customer payment received",

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


    return activity
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 10);
  }
}


export default new SalesDashboardService();