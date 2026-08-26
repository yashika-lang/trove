import Notification from "../models/notification.model.js";

class NotificationRepository {
  async create(data) {
    return await Notification.create(data);
  }

  async findByCompany({ companyId, page, limit }) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ company: companyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Notification.countDocuments({ company: companyId }),

      Notification.countDocuments({ company: companyId, read: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(notificationId, companyId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, company: companyId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(companyId) {
    return await Notification.updateMany(
      { company: companyId, read: false },
      { read: true }
    );
  }
}

export default NotificationRepository;
