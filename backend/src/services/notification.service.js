import NotificationRepository from "../repositories/notification.repository.js";

class NotificationService {
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  // Called from other services (invoice/payment/quotation) to raise a
  // notification. Never throws — a notification failure should not fail
  // the primary operation (invoice/payment/quotation creation) it's
  // attached to.
  async notify({ companyId, type, title, message, relatedId }) {
    try {
      return await this.notificationRepository.create({
        company: companyId,
        type,
        title,
        message,
        relatedId: relatedId ?? null,
      });
    } catch {
      return null;
    }
  }

  async getNotifications(companyId, { page = 1, limit = 20 } = {}) {
    return await this.notificationRepository.findByCompany({
      companyId,
      page: Number(page),
      limit: Number(limit),
    });
  }

  async markAsRead(notificationId, companyId) {
    return await this.notificationRepository.markAsRead(notificationId, companyId);
  }

  async markAllAsRead(companyId) {
    return await this.notificationRepository.markAllAsRead(companyId);
  }
}

// Singleton — other services import this directly to raise notifications
// without needing to know about the repository layer.
const notificationService = new NotificationService();

export default NotificationService;
export { notificationService };
